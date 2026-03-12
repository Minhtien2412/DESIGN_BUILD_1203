/**
 * Quick Interactive Test for Notification Components
 * Run: node scripts/test-notifications-interactive.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.clear();
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║        🧪 INTERACTIVE NOTIFICATION COMPONENT TEST          ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Sample notifications
const notifications = {
  '1': {
    type: 'Live',
    data: {
      id: 'live-001',
      title: '🎥 Live: Hướng dẫn tính năng mới',
      message: 'CEO đang chia sẻ về các tính năng sắp ra mắt trong Q4',
      liveType: 'webinar',
      priority: 'high',
      isActive: true,
      viewerCount: 1234,
      startedAt: new Date(Date.now() - 1800000).toISOString(),
    }
  },
  '2': {
    type: 'System',
    data: {
      id: 'sys-001',
      title: '⚠️ Bảo trì hệ thống khẩn cấp',
      message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng',
      systemType: 'maintenance',
      priority: 'urgent',
      affectedServices: ['API', 'Database', 'Storage'],
    }
  },
  '3': {
    type: 'Event',
    data: {
      id: 'evt-001',
      title: '🚨 Deadline sắp đến hạn',
      message: 'Dự án ABC cần hoàn thành trong 2 giờ',
      eventType: 'deadline',
      priority: 'urgent',
      eventDate: new Date(Date.now() + 7200000).toISOString(),
      location: 'Online',
    }
  },
  '4': {
    type: 'Message',
    data: {
      id: 'msg-001',
      title: 'Tin nhắn mới',
      message: 'Bạn có tin nhắn từ Minh Tiến',
      messageType: 'chat',
      priority: 'normal',
      senderName: 'Minh Tiến',
      preview: 'Hey! Đã xem báo cáo mới chưa?',
    }
  }
};

function displayMenu() {
  console.log('\n📋 Chọn loại thông báo để test:\n');
  console.log('  1️⃣  Live Notification (Webinar đang diễn ra)');
  console.log('  2️⃣  System Notification (Bảo trì khẩn cấp)');
  console.log('  3️⃣  Event Notification (Deadline)');
  console.log('  4️⃣  Message Notification (Chat)');
  console.log('  5️⃣  Test All (Hiển thị tất cả)');
  console.log('  0️⃣  Exit\n');
}

function formatJSON(obj) {
  return JSON.stringify(obj, null, 2)
    .split('\n')
    .map(line => '  ' + line)
    .join('\n');
}

function displayNotification(choice) {
  console.clear();
  
  if (choice === '5') {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 ALL NOTIFICATIONS                      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    Object.entries(notifications).forEach(([key, notif]) => {
      console.log(`\n${key}. ${notif.type} Notification:`);
      console.log('─'.repeat(60));
      console.log(formatJSON(notif.data));
    });
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Total: 4 notification types');
    console.log('─'.repeat(60));
    
  } else if (notifications[choice]) {
    const notif = notifications[choice];
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log(`║              ${notif.type.toUpperCase()} NOTIFICATION TEST              ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('📦 Component Props:');
    console.log(formatJSON(notif.data));
    
    console.log('\n' + '─'.repeat(60));
    
    // Specific features for each type
    switch(notif.type) {
      case 'Live':
        console.log('\n✨ Live Features:');
        console.log(`  • Pulse Animation: ${notif.data.isActive ? '🟢 Active' : '⚫ Inactive'}`);
        console.log(`  • Viewer Count: ${notif.data.viewerCount.toLocaleString()} người`);
        
        const duration = Math.floor((Date.now() - new Date(notif.data.startedAt).getTime()) / 60000);
        console.log(`  • Duration: ${duration} phút`);
        console.log(`  • "LIVE" Badge: ${notif.data.isActive ? '🔴 Showing' : '⚪ Hidden'}`);
        console.log(`  • Join Button: ${notif.data.isActive ? '✅ Visible' : '❌ Hidden'}`);
        break;
        
      case 'System':
        console.log('\n✨ System Features:');
        console.log(`  • Priority Badge: ${notif.data.priority === 'urgent' ? '🚨 URGENT' : '⚠️ ' + notif.data.priority.toUpperCase()}`);
        console.log(`  • Type: ${notif.data.systemType}`);
        console.log(`  • Affected Services: ${notif.data.affectedServices.length} services`);
        notif.data.affectedServices.forEach(service => {
          console.log(`    - ${service}`);
        });
        break;
        
      case 'Event':
        console.log('\n✨ Event Features:');
        const timeLeft = Math.floor((new Date(notif.data.eventDate).getTime() - Date.now()) / 60000);
        console.log(`  • Event Type: ${notif.data.eventType}`);
        console.log(`  • Time Until Event: ${timeLeft} phút (${(timeLeft/60).toFixed(1)} giờ)`);
        console.log(`  • Location: ${notif.data.location}`);
        console.log(`  • Urgent Badge: ${notif.data.priority === 'urgent' ? '🔥 Yes' : 'No'}`);
        break;
        
      case 'Message':
        console.log('\n✨ Message Features:');
        console.log(`  • Sender: ${notif.data.senderName}`);
        console.log(`  • Type: ${notif.data.messageType}`);
        console.log(`  • Preview Length: ${notif.data.preview.length} characters`);
        console.log(`  • Reply Button: ${!notif.data.read ? '✅ Visible' : '❌ Hidden'}`);
        break;
    }
    
    console.log('\n' + '═'.repeat(60));
  }
}

function askQuestion() {
  displayMenu();
  
  rl.question('Chọn số (0-5): ', (answer) => {
    const choice = answer.trim();
    
    if (choice === '0') {
      console.log('\n👋 Tạm biệt! Test complete.\n');
      rl.close();
      return;
    }
    
    if (choice >= '1' && choice <= '5') {
      displayNotification(choice);
      
      console.log('\n');
      rl.question('Nhấn Enter để tiếp tục...', () => {
        console.clear();
        askQuestion();
      });
    } else {
      console.log('\n❌ Lựa chọn không hợp lệ. Vui lòng chọn 0-5.\n');
      setTimeout(askQuestion, 1500);
    }
  });
}

// Start
askQuestion();

rl.on('close', () => {
  console.log('\n✅ Test session ended.');
  process.exit(0);
});
