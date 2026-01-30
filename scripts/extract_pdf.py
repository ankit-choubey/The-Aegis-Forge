
import sys
import re

def extract_text_from_pdf(pdf_path):
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except ImportError:
        # Fallback to strings if pypdf is not installed
        import subprocess
        print("pypdf not found, using strings...")
        result = subprocess.run(["strings", pdf_path], capture_output=True, text=True)
        return result.stdout
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    pdf_path = "/Users/utkarshsingh/agents/DEVRAJ SAHANI Backend JavaScript Developer.pdf"
    print(extract_text_from_pdf(pdf_path))
