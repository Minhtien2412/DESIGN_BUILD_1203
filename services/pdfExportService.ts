/**
 * PDF Export Service - Export AI reports to PDF
 * Uses expo-print and expo-sharing for PDF generation
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface ReportData {
  title: string;
  projectName: string;
  date: string;
  reportType: string;
  summary: string;
  highlights?: string[];
  issues?: string[];
  recommendations?: string[];
  nextSteps?: string[];
  progress?: number;
  images?: string[];
}

class PDFExportService {
  /**
   * Generate HTML template for PDF
   */
  private generateReportHTML(data: ReportData): string {
    const { title, projectName, date, reportType, summary, highlights, issues, recommendations, nextSteps, progress, images } = data;

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #3B82F6;
      margin-bottom: 10px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #111827;
      margin-bottom: 10px;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 15px;
      background: #F3F4F6;
      border-radius: 8px;
    }
    .meta-item {
      flex: 1;
    }
    .meta-label {
      font-size: 12px;
      color: #6B7280;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .meta-value {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    .progress-bar {
      width: 100%;
      height: 30px;
      background: #E5E7EB;
      border-radius: 15px;
      overflow: hidden;
      margin: 20px 0;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3B82F6, #10B981);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #E5E7EB;
    }
    .summary {
      background: #EFF6FF;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #3B82F6;
      margin-bottom: 20px;
    }
    .list {
      list-style: none;
      padding: 0;
    }
    .list-item {
      padding: 12px;
      margin-bottom: 10px;
      background: #F9FAFB;
      border-radius: 6px;
      border-left: 3px solid #3B82F6;
    }
    .list-item.success {
      border-left-color: #10B981;
      background: #ECFDF5;
    }
    .list-item.warning {
      border-left-color: #F59E0B;
      background: #FFFBEB;
    }
    .list-item.error {
      border-left-color: #EF4444;
      background: #FEF2F2;
    }
    .icon {
      display: inline-block;
      width: 20px;
      margin-right: 8px;
    }
    .images {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 20px;
    }
    .image-container {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #E5E7EB;
    }
    .image {
      width: 100%;
      height: auto;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      color: #6B7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🏗️ AI Construction Assistant</div>
    <div class="title">${title}</div>
  </div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Dự án</div>
      <div class="meta-value">${projectName}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Loại báo cáo</div>
      <div class="meta-value">${reportType}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Ngày tạo</div>
      <div class="meta-value">${date}</div>
    </div>
  </div>

  ${progress !== undefined ? `
  <div class="progress-bar">
    <div class="progress-fill" style="width: ${progress}%">
      Tiến độ: ${progress}%
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">📝 Tóm tắt</div>
    <div class="summary">${summary}</div>
  </div>

  ${highlights && highlights.length > 0 ? `
  <div class="section">
    <div class="section-title">✨ Điểm nổi bật</div>
    <ul class="list">
      ${highlights.map(item => `<li class="list-item success"><span class="icon">✓</span>${item}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${issues && issues.length > 0 ? `
  <div class="section">
    <div class="section-title">⚠️ Vấn đề cần chú ý</div>
    <ul class="list">
      ${issues.map(item => `<li class="list-item warning"><span class="icon">⚠</span>${item}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${recommendations && recommendations.length > 0 ? `
  <div class="section">
    <div class="section-title">💡 Khuyến nghị</div>
    <ul class="list">
      ${recommendations.map(item => `<li class="list-item"><span class="icon">→</span>${item}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${nextSteps && nextSteps.length > 0 ? `
  <div class="section">
    <div class="section-title">🎯 Bước tiếp theo</div>
    <ul class="list">
      ${nextSteps.map((item, index) => `<li class="list-item"><span class="icon">${index + 1}.</span>${item}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${images && images.length > 0 ? `
  <div class="section">
    <div class="section-title">📸 Hình ảnh đính kèm</div>
    <div class="images">
      ${images.map(img => `
        <div class="image-container">
          <img src="${img}" class="image" alt="Hình ảnh công trình" />
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Báo cáo được tạo bởi AI Construction Assistant</p>
    <p>© 2024 - Bản quyền thuộc về ứng dụng</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Export report to PDF
   */
  async exportReportToPDF(data: ReportData): Promise<string | null> {
    try {
      const html = this.generateReportHTML(data);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      return uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  }

  /**
   * Export and share PDF
   */
  async exportAndSharePDF(data: ReportData): Promise<boolean> {
    try {
      const uri = await this.exportReportToPDF(data);
      if (!uri) {
        return false;
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Sharing is not available on this device');
        return false;
      }

      // Share the PDF
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Chia sẻ báo cáo',
        UTI: 'com.adobe.pdf',
      });

      return true;
    } catch (error) {
      console.error('Error sharing PDF:', error);
      return false;
    }
  }

  /**
   * Print PDF directly (open print dialog)
   */
  async printPDF(data: ReportData): Promise<boolean> {
    try {
      const html = this.generateReportHTML(data);

      await Print.printAsync({
        html,
      });

      return true;
    } catch (error) {
      console.error('Error printing PDF:', error);
      return false;
    }
  }
}

export const pdfExportService = new PDFExportService();
