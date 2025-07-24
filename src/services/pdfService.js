// PDF Service
// Handles PDF generation requests to the backend service


const PDF_SERVICE_URL = 'http://127.0.0.1:5001/api/reports';

import { jsPDF } from 'jspdf'
=======
// Base URL for the PDF service
// Can be overridden via the `VITE_PDF_SERVICE_URL` environment variable
const PDF_SERVICE_URL =
  import.meta.env.VITE_PDF_SERVICE_URL ||
  'https://5000-idd93o1prlynxk19ggzn6-afbdef95.manusvm.computer/api/reports';


class PDFService {
  constructor() {
    this.baseURL = PDF_SERVICE_URL;
  }

  // Generate PDF report from inspection data
  async generatePDFReport(reportData) {
    try {
      const response = await fetch(`${this.baseURL}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'maintenance_report.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error generating PDF via backend:', error);
      try {
        const fallbackName = 'maintenance_report.pdf'
        const doc = new jsPDF()
        doc.text('Maintenance Report', 10, 10)
        const yStart = 20
        let y = yStart
        Object.entries(reportData).forEach(([key, value]) => {
          if (Array.isArray(value)) return
          doc.text(`${key}: ${String(value)}`, 10, y)
          y += 10
        })
        doc.save(fallbackName)
        return { success: true, filename: fallbackName }
      } catch (e) {
        console.error('Fallback PDF generation failed:', e)
        throw e
      }
    }
  }

  // Preview HTML report (for testing)
  async previewHTMLReport(reportData) {
    try {
      const response = await fetch(`${this.baseURL}/preview-html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`HTML preview failed: ${response.status}`);
      }

      const html = await response.text();
      
      // Open in new window for preview
      const newWindow = window.open('', '_blank');
      newWindow.document.write(html);
      newWindow.document.close();
      
      return { success: true };
    } catch (error) {
      console.error('Error generating HTML preview:', error);
      throw error;
    }
  }

  // Health check for PDF service
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PDF service health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Prepare report data from session and robot information
  prepareReportData(session, robot, user, customer) {
    // Extract maintenance items from session responses
    const maintenanceItems = [];
    
    if (session.responses) {
      Object.entries(session.responses).forEach(([questionId, response]) => {
        // Convert session responses to maintenance items format
        maintenanceItems.push({
          item: questionId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), // Convert camelCase to readable
          status: response === true ? 'completed' : response === false ? 'pending' : 'pending',
          notes: session.notes && session.notes[questionId] ? session.notes[questionId] : ''
        });
      });
    }

    // Extract images from session
    const images = [];
    if (session.images) {
      Object.entries(session.images).forEach(([stepName, stepImages]) => {
        stepImages.forEach((imageUrl) => {
          images.push({
            url: imageUrl,
            step_name: stepName,
            timestamp: session.startTime ? session.startTime.toISOString() : new Date().toISOString()
          });
        });
      });
    }

    return {
      inspection_id: session.id || 'unknown',
      customer_name: customer ? customer.name : (robot.customer ? robot.customer.name : ''),
      site_address: customer ? customer.address : (robot.customer ? robot.customer.address : ''),
      report_date: session.startTime ? session.startTime.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      technician_name: user ? user.name : '',
      robot_nickname: robot.name || robot.nickname || '',
      robot_model: robot.model || robot.type || '',
      robot_serial: robot.serialNumber || robot.serial_number || '',
      maintenance_items: maintenanceItems,
      images: images,
      notes: session.generalNotes || session.notes || ''
    };
  }
}

// Create and export a singleton instance
const pdfService = new PDFService();
export default pdfService;

