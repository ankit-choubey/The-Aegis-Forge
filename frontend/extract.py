import re
import os

markdown_path = '/Users/utkarshsingh/agents/frontend/components/interview/Aegis_Landing_Migration (1).md'
base_dir = '/Users/utkarshsingh/agents/frontend'

with open(markdown_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Logic to extract file path and code blocks from the markdown
# The headings look like: ### `components/sections/HeroGSAP.tsx`
# Followed by: ```tsx ...code... ```

sections = re.split(r'### `([^`]+)`', content)

for i in range(1, len(sections), 2):
    file_path = sections[i].strip()
    code_content_match = re.search(r'```[a-z]*\n(.*?)```', sections[i+1], re.DOTALL)
    
    if code_content_match:
        code_content = code_content_match.group(1).strip()
        full_path = os.path.join(base_dir, file_path)
        
        # Ensure directories exist
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(code_content)
            
        print(f"Written: {full_path}")
    else:
        print(f"Could not find code block for {file_path}")

