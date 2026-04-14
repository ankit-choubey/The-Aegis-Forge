import json
import os
import sys

# Ensure the app directory is in the path so we can import internal modules
sys.path.append(os.getcwd())

from app.analysis.pdf_generator import PDFReportGenerator

def generate_mock_pdf():
    mock_json_path = "/Users/utkarshsingh/.gemini/antigravity/brain/0f583f21-4db7-4fee-ae63-a72ec6573387/mock_fsir_report.json"
    output_pdf_path = "/Users/utkarshsingh/agents/mock_fsir_report.pdf"
    
    print(f"Reading mock data from: {mock_json_path}")
    with open(mock_json_path, "r") as f:
        fsir_data = json.load(f)
    
    print("Initializing PDF Generator...")
    generator = PDFReportGenerator()
    
    print("Generating PDF bytes...")
    pdf_bytes = generator.generate_report_bytes(fsir_data)
    
    print(f"Writing PDF to: {output_pdf_path}")
    with open(output_pdf_path, "wb") as f:
        f.write(pdf_bytes)
    
    print("SUCCESS: Mock PDF generated.")

if __name__ == "__main__":
    generate_mock_pdf()
