from flask import Blueprint, request, jsonify, send_file
import asyncio
from pyppeteer import launch
import tempfile
import os
import json
from jinja2 import Template
import requests
from datetime import datetime

pdf_report_bp = Blueprint('pdf_report', __name__)

def format_status(status):
    """Format status for display"""
    if status == 'completed':
        return 'YES'
    elif status == 'pending':
        return 'NO'
    else:
        return status.upper()

async def generate_pdf_from_html(html_content):
    """Generate PDF from HTML using Pyppeteer"""
    browser = await launch(
        headless=True,
        args=['--no-sandbox', '--disable-setuid-sandbox']
    )
    page = await browser.newPage()
    
    # Set A4 page size
    await page.setViewport({'width': 794, 'height': 1123})
    
    await page.setContent(html_content, {'waitUntil': 'networkidle0'})
    
    # Generate PDF with A4 format
    pdf_buffer = await page.pdf({
        'format': 'A4',
        'printBackground': True,
        'margin': {
            'top': '0.5in',
            'right': '0.5in',
            'bottom': '0.5in',
            'left': '0.5in'
        }
    })
    
    await browser.close()
    return pdf_buffer

def create_html_report(report_data):
    """Create HTML report from template and data"""
    
    # Read the HTML template
    template_path = os.path.join(os.path.dirname(__file__), '..', 'templates', 'report_template.html')
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()
    
    template = Template(template_content)
    
    # Add helper values to template context
    report_data['format_status'] = format_status
    report_data.setdefault('generated_time', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    return template.render(**report_data)

@pdf_report_bp.route('/generate-pdf', methods=['POST'])
def generate_pdf_report():
    """Generate PDF report from inspection data sent from frontend"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract report data from request
        report_data = {
            'customer_name': data.get('customer_name', ''),
            'site_address': data.get('site_address', ''),
            'report_date': data.get('report_date', ''),
            'technician_name': data.get('technician_name', ''),
            'robot_nickname': data.get('robot_nickname', ''),
            'robot_model': data.get('robot_model', ''),
            'robot_serial': data.get('robot_serial', ''),
            'maintenance_items': data.get('maintenance_items', []),
            'images': data.get('images', []),
            'notes': data.get('notes', ''),
        }
        
        # Generate HTML report
        html_content = create_html_report(report_data)
        
        # Generate PDF
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        pdf_buffer = loop.run_until_complete(generate_pdf_from_html(html_content))
        loop.close()
        
        # Save PDF to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(pdf_buffer)
            tmp_file_path = tmp_file.name
        
        # Generate filename
        inspection_id = data.get('inspection_id', 'unknown')
        filename = f'maintenance_report_{inspection_id}_{datetime.now().strftime("%Y%m%d")}.pdf'
        
        # Return PDF file
        return send_file(
            tmp_file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return jsonify({'error': str(e)}), 500

@pdf_report_bp.route('/preview-html', methods=['POST'])
def preview_html_report():
    """Preview HTML report (for testing)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract report data from request
        report_data = {
            'customer_name': data.get('customer_name', ''),
            'site_address': data.get('site_address', ''),
            'report_date': data.get('report_date', ''),
            'technician_name': data.get('technician_name', ''),
            'robot_nickname': data.get('robot_nickname', ''),
            'robot_model': data.get('robot_model', ''),
            'robot_serial': data.get('robot_serial', ''),
            'maintenance_items': data.get('maintenance_items', []),
            'images': data.get('images', []),
            'notes': data.get('notes', ''),
        }
        
        # Generate HTML report
        html_content = create_html_report(report_data)
        
        return html_content, 200, {'Content-Type': 'text/html'}
        
    except Exception as e:
        print(f"Error generating HTML preview: {e}")
        return jsonify({'error': str(e)}), 500

@pdf_report_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'pdf-report-service'})

