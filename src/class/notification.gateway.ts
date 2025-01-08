import {WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { LopHoc } from 'src/users/entity/class.entity';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Cấu hình CORS (cho phép mọi origin, tùy chỉnh nếu cần)
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(LopHoc)
    private readonly classRepository: Repository<LopHoc>,
  ) {}

  // private users = new Map<string, { id: string; fullName: string; userName: string }>();
  // private approvedUsers = new Map<string, Set<string>>();
  // Map để lưu trữ danh sách người dùng trong từng phòng học
  private rooms = new Map<
    string,
    { userId: string; fullName: string; userName: string }[]
  >();

  // Map để lưu trữ danh sách yêu cầu tham gia theo mã lớp
  private waitingApproval = new Map<
  string,
  { userId: string; fullName: string; userName: string }[]
  >();


  private logger = new Logger('NotificationGateway');

  // Lưu trữ kết nối giữa userId và socketId
  private userSockets = new Map<number, Set<string>>();

  /**
   * Xử lý khi có một client kết nối
   * @param client Socket
   */
  handleConnection(client: Socket) {
    const { userId, fullName, userName, classCode } = client.handshake.query;

    if (!userId || !classCode) {
        this.logger.warn('Client không cung cấp userId hoặc classCode, đóng kết nối');
        client.disconnect();
        return;
    }

    const userIdNumber = parseInt(userId as string, 10);

    if (!this.userSockets.has(userIdNumber)) {
        this.userSockets.set(userIdNumber, new Set());
    }

    const sockets = this.userSockets.get(userIdNumber);
    if (!sockets) {
        this.logger.error(`Không thể khởi tạo Set cho userId ${userIdNumber}`);
        return;
    }

    sockets.add(client.id);

    this.logger.log(`Client với userId ${userIdNumber} đã kết nối (socketId: ${client.id})`);
    this.logger.log(`userSockets sau khi khởi tạo: ${JSON.stringify([...this.userSockets.entries()].map(([k, v]) => [k, [...v]]))}`);

    this.logState();
  }

  /**
   * Xử lý khi một client gửi yêu cầu join-room
   */
  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { classCode: string; userId: string; fullName: string; userName: string }) {
    const { classCode, userId, fullName, userName } = payload;

    this.logger.log(`Client ${client.id} gửi yêu cầu tham gia phòng ${classCode}`);

    this.joinRoom(client, classCode, userId, fullName, userName);
  }

  /**
   * Hàm xử lý logic tham gia phòng
   */
  private joinRoom(client: Socket, classCode: string, userId: string, fullName: string, userName: string) {
    const roomUsers = this.rooms.get(classCode) || [];
    const user = { userId, fullName, userName };

    // Kiểm tra trùng lặp
    const existingUser = roomUsers.find((u) => u.userId === userId);
    if (!existingUser) {
      roomUsers.push(user);
      this.rooms.set(classCode, roomUsers);

      this.logger.log(`Thêm người dùng ${userId} vào phòng ${classCode}`);
      this.logger.log(`Danh sách người dùng cập nhật trong phòng ${classCode}: ${JSON.stringify(roomUsers)}`);
    }

    // Tham gia phòng
    client.join(classCode);

    // Phát danh sách người dùng tới toàn bộ phòng
    this.server.to(classCode).emit('room-users', roomUsers);
    this.logger.log(`Phát sự kiện room-users tới phòng ${classCode} với dữ liệu: ${JSON.stringify(roomUsers)}`);
  }

  /**
   * Xử lý khi có một client ngắt kết nối
   * @param client Socket
   */
  handleDisconnect(client: Socket) {
    const { userId, fullName, classCode } = client.handshake.query;

    this.logger.log(`Xử lý ngắt kết nối: socketId=${client.id}, userId=${userId}, classCode=${classCode}`);

    if (!userId || !classCode) {
        this.logger.warn(`Không tìm thấy userId hoặc classCode trong handshake khi ngắt kết nối.`);
        return;
    }

    const userIdNumber = parseInt(userId as string, 10);

    // Log trạng thái trước
    // this.logger.log(`Trước khi xử lý: userSockets=${JSON.stringify([...this.userSockets.entries()])}, rooms=${JSON.stringify([...this.rooms])}`);


    // Xóa socketId khỏi Set của userId
    const sockets = this.userSockets.get(userIdNumber);
    if (sockets && sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
            this.userSockets.delete(userIdNumber);
        }
        this.logger.log(`Xóa socketId: ${client.id} khỏi userSockets cho userId ${userIdNumber}`);
    } else {
        this.logger.warn(`Không tìm thấy socketId ${client.id} trong userSockets của userId ${userIdNumber}`);
    }

    // Xóa người dùng khỏi phòng
    if (this.rooms.has(classCode as string)) {
      const roomUsers = this.rooms.get(classCode as string);
      // const updatedUsers = roomUsers.filter((user) => user.userId !== userId);
      const updatedUsers = roomUsers.filter(
        (user) => String(user.userId) !== String(userId)
      );
      this.rooms.set(classCode as string, updatedUsers);

      // Nếu phòng rỗng, xóa phòng
      if (updatedUsers.length === 0) {
        this.rooms.delete(classCode as string);
        this.logger.log(`Phòng ${classCode} đã bị xóa vì không còn người dùng.`);
      }
      this.logger.log(`Client với userId ${userId} đã rời phòng ${classCode}`);

      // Phát danh sách người dùng cập nhật
      this.server.to(classCode as string).emit('room-users', updatedUsers);
    } else {
      this.logger.warn(`Phòng ${classCode} không tồn tại khi xử lý ngắt kết nối.`);
    }

    this.logState();
    // this.logger.log(`Sau khi xử lý: userSockets=${JSON.stringify([...this.userSockets.entries()])}, rooms=${JSON.stringify([...this.rooms])}`);

  }

  private logState() {
    // Log trạng thái userSockets
    const userSocketsArray = Array.from(this.userSockets.entries()).map(
        ([key, value]) => [key, Array.from(value)]
    );
    this.logger.log(`Danh sách userSockets hiện tại: ${JSON.stringify(userSocketsArray)}`);

    // Log trạng thái rooms
    const roomsArray = Array.from(this.rooms.entries()).map(
        ([key, value]) => ({ classCode: key, users: value })
    );
    this.logger.log(`Danh sách rooms hiện tại: ${JSON.stringify(roomsArray)}`);
  }


    /**
   * Xử lý sự kiện WebRTC offer
   */
    @SubscribeMessage('offer')
    // async handleOffer(client: Socket, payload: { offer: RTCSessionDescriptionInit, targetUserId: number, senderUserId: number }) {
    //   const targetSocketIds = this.userSockets.get(payload.targetUserId);
    //   // console.log(payload.targetUserId, typeof(payload.targetUserId), targetSocketIds); // Debug


    //   if (targetSocketIds && targetSocketIds.size > 0) {
    //       this.logger.log(`Nhận 'offer' từ client ${client.id}, phát đến userId ${payload.targetUserId}`);
          
    //       targetSocketIds.forEach(targetSocketId => {
    //           this.server.to(targetSocketId).emit('offer', {
    //               offer: payload.offer,
    //               senderUserId: payload.senderUserId,
    //           });
    //       });
    //   } else {
    //       this.logger.warn(`Không tìm thấy socket cho userId ${payload.targetUserId}`);
    //   }
    // }    
  
    handleOffer(client: Socket, payload: { offer: RTCSessionDescriptionInit; room: string; senderId: string }) {
      const { room, senderId } = payload;
      this.logger.log(`Nhận 'offer' từ client ${client.id} và phát trong room: ${room}`);
      this.server.to(room).emit('offer', { offer: payload.offer });
    }

    /**
     * Xử lý sự kiện WebRTC answer
     */
    @SubscribeMessage('answer')
    // async handleAnswer(client: Socket, payload: { answer: RTCSessionDescriptionInit, targetUserId: number|string }) {
    //     const targetUserId = typeof payload.targetUserId === 'string' 
    //       ? parseInt(payload.targetUserId, 10) 
    //       : payload.targetUserId; // Ép kiểu nếu cần

    //     const targetSocketIds = this.userSockets.get(targetUserId);
    //     // this.logState();
    //     // console.log(payload.targetUserId, typeof payload.targetUserId); // Debug kiểu gốc
    //     // console.log(targetUserId, typeof targetUserId, targetSocketIds); // Debug sau ép kiểu 
    
    //     if (targetSocketIds && targetSocketIds.size > 0) {
    //         const validSocketIds = Array.from(targetSocketIds).filter(
    //             (id) => this.server.sockets.sockets.has(id)
    //         );
    
    //         this.logger.log(`SocketId hợp lệ cho userId ${payload.targetUserId}: ${JSON.stringify(validSocketIds)}`);
    
    //         if (validSocketIds.length > 0) {
    //             validSocketIds.forEach((socketId) => {
    //                 this.server.to(socketId).emit('answer', {
    //                     answer: payload.answer,
    //                 });
    //                 this.logger.log(`Gửi 'answer' tới socketId: ${socketId}`);
    //             });
    //         } else {
    //             this.logger.warn(`Không tìm thấy socket hợp lệ cho userId ${payload.targetUserId}`);
    //         }
    //     } else {
    //         this.logger.warn(`Không tìm thấy socket cho userId ${payload.targetUserId}`);
    //     }
    //     // const allSockets = Array.from(this.server.sockets.sockets.keys());
    //     // this.logger.log(`Tất cả socketId hiện tại trên server: ${JSON.stringify(allSockets)}`);
    // }
    handleAnswer(client: Socket, payload: { answer: RTCSessionDescriptionInit; room: string; senderId: string }) {
      const { room, senderId } = payload;
      this.logger.log(`Nhận 'answer' từ client ${client.id} và phát trong room: ${room}`);
      this.server.to(room).emit('answer', { answer: payload.answer });
    }
  
    /**
     * Xử lý sự kiện WebRTC ICE Candidate
     */
    @SubscribeMessage('ice-candidate')
    // async handleIceCandidate(client: Socket, payload: { candidate: RTCIceCandidate, targetUserId: number|string, senderUserId: string|number }) {
    //   const targetUserId = typeof payload.targetUserId === 'string'
    //   ? parseInt(payload.targetUserId, 10)
    //   : payload.targetUserId;

    //   const targetSocketIds = this.userSockets.get(targetUserId);

    //   if (targetSocketIds && targetSocketIds.size > 0) {
    //       this.logger.log(`Nhận 'ice-candidate' từ client ${client.id}, phát đến userId ${payload.targetUserId}`);
          
    //       targetSocketIds.forEach(targetSocketId => {
    //           this.server.to(targetSocketId).emit('ice-candidate', {
    //               candidate: payload.candidate,
    //               senderUserId: payload.senderUserId,
    //           });
    //       });
    //   } else {
    //       this.logger.warn(`Không tìm thấy socket cho userId ${payload.targetUserId}`);
    //   }
    // }    

    handleIceCandidate(client: Socket, payload: { candidate: RTCIceCandidate; room: string; senderId: string }) {
      const { room, senderId } = payload;
      this.logger.log(`Nhận 'ice-candidate' từ client ${client.id} và phát trong room: ${room}`);
      this.server.to(room).emit('ice-candidate', { candidate: payload.candidate });
    }

  /**
   * Gửi thông báo tới một người dùng cụ thể
   * @param userId ID của người dùng
   * @param notification Nội dung thông báo
   */
  sendNotification(userId: number, notification: { title: string; message: string }) {
    const targetSocketIds = this.userSockets.get(userId);
    
    if (targetSocketIds && targetSocketIds.size > 0) {
        targetSocketIds.forEach(socketId => {
            this.server.to(socketId).emit('notification', notification);
        });
        
        this.logger.log(`Đã gửi thông báo đến userId ${userId}: ${JSON.stringify(notification)}`);
        this.logger.log(`Danh sách phòng: ${Array.from(this.server.sockets.adapter.rooms.keys()).join(', ')}`);
    } else {
        this.logger.warn(`Không tìm thấy kết nối cho userId ${userId}`);
    }
  }

  /**
   * Gửi thông báo tới tất cả người dùng
   * @param notification Nội dung thông báo
   */
  sendBroadcast(notification: { title: string; message: string }) {
    this.server.emit('notification', notification);
    this.logger.log(`Đã gửi thông báo broadcast: ${JSON.stringify(notification)}`);
  }

  @SubscribeMessage('join-request')
  handleJoinRequest(
    client: Socket,
    payload: { classCode: string; userId: string; fullName: string; userName: string },
  ) {
    const { classCode, userId, fullName, userName } = payload;

    if (!classCode || !userId || !fullName || !userName) {
      this.logger.warn('Dữ liệu yêu cầu tham gia không hợp lệ');
      return;
    }

    // Lấy danh sách yêu cầu hiện tại của phòng
    const requests = this.waitingApproval.get(classCode) || [];
    requests.push({ userId, fullName, userName });
    this.waitingApproval.set(classCode, requests);

    // // Gửi thông báo tới tất cả các thành viên trong phòng (hoặc chủ phòng)
    // this.server.to(classCode).emit('join-request', requests);
    // this.logger.log(`Client rooms: ${Array.from(client.rooms).join(', ')}`);


    this.logger.log(
      `Yêu cầu tham gia từ ${fullName} (${userName}) được gửi tới phòng ${classCode}`,
    );

    this.logger.log(
      `Cập nhật danh sách yêu cầu: ${JSON.stringify(requests)}`,
    );
  
    this.server.to(classCode).emit('join-request', requests);
  
    this.logger.log(`Đã phát sự kiện 'join-request' tới phòng ${classCode}`);
  }

  @SubscribeMessage('handle-join-request')
  handleApprovalRequest(
    client: Socket,
    payload: { classCode: string; userId: string; action: 'approve' | 'reject' },
  ) {
    const { classCode, userId, action } = payload;

    if (!classCode || !userId || !action) {
      this.logger.warn('Dữ liệu xử lý yêu cầu không hợp lệ');
      return;
    }

    // Lấy danh sách yêu cầu và xóa người dùng
    const requests = this.waitingApproval.get(classCode) || [];
    const updatedRequests = requests.filter((user) => user.userId !== userId);
    this.waitingApproval.set(classCode, updatedRequests);

    // Nếu phê duyệt, thêm người dùng vào danh sách phòng
    if (action === 'approve') {
      const roomUsers = this.rooms.get(classCode) || [];
      const approvedUser = requests.find((user) => user.userId === userId);
      if (approvedUser) {
        roomUsers.push(approvedUser);
        this.rooms.set(classCode, roomUsers);

        // Gửi danh sách người dùng cập nhật
        this.server.to(classCode).emit('room-users', roomUsers);
      }
    }

    // Gửi danh sách yêu cầu chờ phê duyệt cập nhật
    this.server.to(classCode).emit('join-request', updatedRequests);

    this.logger.log(
      `Yêu cầu từ userId ${userId} đã được ${action === 'approve' ? 'phê duyệt' : 'từ chối'} trong phòng ${classCode}`,
    );

    // Phát phản hồi tới người gửi yêu cầu
    const userSocketIds = this.userSockets.get(parseInt(userId, 10));
    if (userSocketIds && userSocketIds.size > 0) {
      // Gửi tới tất cả các socket của người dùng
      userSocketIds.forEach(userSocketId => {
        this.server.to(userSocketId).emit('approval-response', {
          status: action === 'approve' ? 'approved' : 'rejected',
        });
      });
    }
  }

  /**
   * Lắng nghe sự kiện gửi tin nhắn
   * @param client Socket
   * @param payload Dữ liệu tin nhắn
   */
  @SubscribeMessage('send-message')
  handleSendMessage(client: Socket, payload: { message: any; classCode: string }) {
    const { message, classCode } = payload;

    if (!this.rooms.has(classCode)) {
      this.logger.warn(`Phòng ${classCode} không tồn tại.`);
      return;
    }

    this.logger.log(`Nhận tin nhắn từ userId ${message.userId}: "${message.text}"`);
    // Phát tin nhắn cho cả phòng
    this.server.to(classCode).emit('receive-message', message);
  }

  /**
   * Lắng nghe sự kiện gửi file
   * @param client Socket
   * @param payload Dữ liệu file
   */
  @SubscribeMessage('send-file')
  handleSendFile(client: Socket, payload: { message: any; classCode: string }) {
    const { message, classCode } = payload;

    if (!this.rooms.has(classCode)) {
      this.logger.warn(`Phòng ${classCode} không tồn tại.`);
      return;
    }

    this.logger.log(`Nhận file từ userId ${message.userId}: "${message.text}"`);
    // Phát file cho cả phòng
    this.server.to(classCode).emit('receive-message', message);
  }

  @SubscribeMessage('raise_hand')
  handleRaiseHand(client: Socket, payload: { 
    userId: number, 
    classCode: string, 
    fullName: string, 
    userName: string 
  }) {
    // Broadcast sự kiện giơ tay đến tất cả các client trong cùng lớp học
    this.server.to(payload.classCode).emit('hand_raised', {
      userId: payload.userId,
      fullName: payload.fullName,
      userName: payload.userName
    });

    this.logger.log(`${payload.fullName} đang giơ tay trong lớp ${payload.classCode}`);
  }

  // Server
  // @SubscribeMessage('test-event')
  // handleTestEvent(client: Socket, payload: any) {
  //   console.log('Received test-event:', payload);
  //   client.emit('test-response', { message: 'Hello client' });
  // }
}
