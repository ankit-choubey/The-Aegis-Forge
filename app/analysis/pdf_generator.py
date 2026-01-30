import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT

class PDFReportGenerator:
    def __init__(self):
        self.width, self.height = LETTER
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()

    def _create_custom_styles(self):
        # Aegis Blue/Purple Colors
        self.primary_color = colors.HexColor("#4F46E5") # Indigo
        self.accent_color = colors.HexColor("#818CF8") # Light Indigo
        self.bg_color = colors.HexColor("#EEF2FF") # Very light indigo
        
        # Custom Headers
        self.styles.add(ParagraphStyle(
            name='AegisTitle',
            parent=self.styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            textColor=self.primary_color,
            spaceAfter=20,
            alignment=TA_LEFT
        ))
        
        self.styles.add(ParagraphStyle(
            name='AegisSection',
            parent=self.styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=16,
            textColor=self.primary_color,
            spaceBefore=15,
            spaceAfter=10
        ))
        
        self.styles.add(ParagraphStyle(
            name='ExecutiveBlock',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            leading=16,
            textColor=colors.black,
            backColor=self.bg_color,
            borderPadding=15,
            borderColor=self.accent_color,
            borderWidth=1,
            borderRadius=5
        ))

    def generate_report_bytes(self, fsir_data: dict) -> bytes:
        """
        Generates the PDF and returns the bytes.
        fsir_data is the Dict representation of the FSIR schema.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=LETTER, topMargin=40, bottomMargin=40)
        elements = []

        # 1. Header
        elements.append(Paragraph("Detailed FSIR Report Structure", self.styles['AegisTitle']))
        elements.append(Paragraph("First-Round Screening Intelligence Report", self.styles['Normal']))
        elements.append(Spacer(1, 20))

        # 2. Executive Decision Block
        elements.append(Paragraph("- Executive Decision Block", self.styles['AegisSection']))
        
        status_text = (
            f"<b>Candidate Status: <font color='#4F46E5'>{fsir_data.get('decision', 'PENDING').upper()}</font></b><br/>"
            f"<b>Overall Confidence: {fsir_data.get('confidence_score', 'N/A')}</b><br/><br/>"
            f"Role Screened: {fsir_data.get('candidate_id', 'Unknown Role')}<br/><br/>"
            f"<b>Primary Reason:</b> {fsir_data.get('reason_for_decision', 'N/A')}"
        )
        elements.append(Paragraph(status_text, self.styles['ExecutiveBlock']))
        elements.append(Spacer(1, 20))

        # 3. Crisis Timeline Table
        elements.append(Paragraph("- Crisis Performance Timeline", self.styles['AegisSection']))
        
        timeline_data = [["Time", "Candidate Action", "System State Change", "Evaluation"]]
        for event in fsir_data.get('timeline', []):
            timeline_data.append([
                event.get('time', ''),
                Paragraph(event.get('action', ''), self.styles['Normal']),
                event.get('state_change', ''),
                event.get('evaluation', '')
            ])
            
        t = Table(timeline_data, colWidths=[0.8*inch, 2.5*inch, 2*inch, 1.2*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.bg_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 20))

        # 4. DQI Breakdown (Big Metrics)
        elements.append(Paragraph("- Decision Quality Index (DQI) Breakdown", self.styles['AegisSection']))
        
        dqi = fsir_data.get('dqi_breakdown', {})
        # Create a mini table for the dashboard look
        dqi_metrics = [
            [
                f"{dqi.get('score', 0)} / 100", 
                str(dqi.get('correct_decisions', 0)), 
                str(dqi.get('recoverable_mistakes', 0))
            ],
            ["DQI Score", "Correct Decisions", "Recoverable Mistakes"]
        ]
        
        dqi_table = Table(dqi_metrics, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
        dqi_table.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 24),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TEXTCOLOR', (0,0), (-1,0), self.primary_color),
            ('TOPPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(dqi_table)
        elements.append(Spacer(1, 20))

        # 5. Agent Consensus Grid
        elements.append(Paragraph("- Agent Consensus Panel", self.styles['AegisSection']))
        
        consensus = fsir_data.get('agent_consensus', {})
        # Grid Layout: 2x2
        grid_data = [
            [
                f"<b>Incident Lead Agent</b><br/>{consensus.get('incident_lead', 'N/A')}",
                f"<b>Pressure Agent</b><br/>{consensus.get('pressure_agent', 'N/A')}"
            ],
            [
                f"<b>Observer Agent</b><br/>{consensus.get('observer_agent', 'N/A')}",
                f"<b>Protocol Governor</b><br/>{consensus.get('protocol_governor', 'N/A')}"
            ]
        ]
        
        # Define style for agent blocks
        agent_table = Table(grid_data, colWidths=[3.5*inch, 3.5*inch])
        agent_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), self.bg_color),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('GRID', (0,0), (-1,-1), 5, colors.white), # White gaps between cells
            ('PADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(agent_table)

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.read()
