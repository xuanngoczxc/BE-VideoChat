import { Injectable } from '@nestjs/common';

@Injectable()
export class WebRTCService {
  private rooms: Map<string, Set<string>> = new Map();
  getRooms() {
    throw new Error('Method not implemented.');
  }
  getRoomInfo(id: string) {
    throw new Error('Method not implemented.');
  }
  createRoom(roomName: string) {
    throw new Error('Method not implemented.');
  }
  // Thêm các phương thức xử lý logic WebRTC nếu cần
}