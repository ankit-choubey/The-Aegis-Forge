import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Graphics for Charts
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.spider import SpiderChart # [NEW]
from reportlab.graphics.widgets.markers import makeMarker

class PDFReportGenerator:
    def __init__(self):
        self.width, self.height = LETTER
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()

    def _create_custom_styles(self):
        # Aegis Colors
        self.primary_color = colors.HexColor("#4F46E5") # Indigo
        self.accent_color = colors.HexColor("#818CF8") # Light Indigo
        self.bg_color = colors.HexColor("#EEF2FF") # Very light indigo
        self.text_color = colors.HexColor("#1F2937") # Gray 800
        
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
        
        self.styles.add(ParagraphStyle(
            name='MetricLabel',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            textColor=colors.grey
        ))

    def generate_report_bytes(self, fsir_data: dict) -> bytes:
        """
        Generates the PDF and returns the bytes.
        fsir_data is the Dict representation of the FSIR schema.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=LETTER, topMargin=40, bottomMargin=40, rightMargin=40, leftMargin=40)
        elements = []

        # 1. Header
        elements.append(Paragraph("Detailed FSIR Report Structure", self.styles['AegisTitle']))
        elements.append(Paragraph("First-Round Screening Intelligence Report", self.styles['Normal']))
        elements.append(Spacer(1, 20))

        # 2. Executive Decision Block
        elements.append(Paragraph("- Executive Decision Block (Top 10 Seconds)", self.styles['AegisSection']))
        
        status_color = "#4F46E5" # Default Indigo
        if "REJECT" in fsir_data.get('decision', ''):
             status_color = "#DC2626" # Red
        
        # [FIX 1] Added Candidate Name
        status_text = (
            f"<b>Candidate Name: <font color='#1F2937'>{fsir_data.get('candidate_id', 'Unknown')}</font></b><br/>"
            f"<b>Candidate Status: <font color='{status_color}'>{fsir_data.get('decision', 'PENDING').upper()}</font></b><br/>"
            f"<b>Overall Confidence: {fsir_data.get('overall_confidence', 'N/A')}</b><br/><br/>"
            f"Role Screened: {fsir_data.get('role_screened', 'Unknown Role')}<br/><br/>"
            f"<b>Primary Reason:</b> {fsir_data.get('primary_reason', 'N/A')}"
        )
        elements.append(Paragraph(status_text, self.styles['ExecutiveBlock']))
        elements.append(Spacer(1, 20))

        # [NEW] Competency Radar Chart
        radar_data = fsir_data.get('competency_radar') # Expecting DQIRadar dict/obj
        if radar_data:
             elements.append(Paragraph("- Competency Radar", self.styles['AegisSection']))
             
             # Convert Pydantic/Dict to list
             if hasattr(radar_data, 'model_dump'):
                 r_dict = radar_data.model_dump()
             else:
                 r_dict = radar_data if isinstance(radar_data, dict) else {}

             if r_dict:
                 # Order matters for the chart labels
                 labels = ["Communication", "Problem Solving", "Technical", "Testing", "System Design", "Crisis Mgmt"]
                 keys = ["communication", "problem_solving", "technical", "testing", "system_design", "crisis_management"]
                 data_points = [r_dict.get(k, 0) for k in keys]
                 
                 drawing = Drawing(400, 200)
                 sp = SpiderChart()
                 sp.x = 50
                 sp.y = 10
                 sp.width = 300
                 sp.height = 180
                 sp.data = [data_points]
                 sp.labels = labels
                 sp.strands.strokeColor = self.accent_color
                 sp.fillColor = colors.Color(0.31, 0.27, 0.9, 0.2) # Transparent Indigo
                 sp.strands.strokeWidth = 2
                 sp.spokes.strokeDashArray = (2, 2)
                 
                 drawing.add(sp)
                 elements.append(drawing)
                 elements.append(Spacer(1, 20))

        # 3. Crisis Timeline Table
        elements.append(Paragraph("- Crisis Performance Timeline (Human-Readable)", self.styles['AegisSection']))
        
        timeline_data = [["Time", "Candidate Action", "System State Change", "Evaluation"]]
        timeline_events = fsir_data.get('crisis_timeline', [])
        
        # Sort by time string (naive assumption "12s" -> 12)
        try:
            timeline_events.sort(key=lambda x: int(x.get('time', '0').replace('s','')))
        except:
            pass

        for event in timeline_events:
            timeline_data.append([
                event.get('time', ''),
                Paragraph(event.get('action', ''), self.styles['Normal']),
                Paragraph(event.get('state_change', ''), self.styles['Normal']),
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
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.whitesmoke]),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 20))

        # --- SENTIMENT & RESILIENCE ARC ---
        elements.append(Paragraph("- Sentiment & Resilience Arc", self.styles['AegisSection']))
        elements.append(Paragraph("Visualizing candidate confidence and resilience throughout the session.", self.styles['Normal']))
        elements.append(Spacer(1, 10))
        
        graph_data = []
        for e in timeline_events:
            try:
                t_val = int(e.get('time', '0').replace('s', ''))
                # Prefer sentiment_score, fallback to pressure_handling_score
                s_val = e.get('sentiment_score')
                if s_val is None:
                    s_val = e.get('pressure_handling_score')
                    
                if s_val is not None:
                    graph_data.append((t_val, s_val))
            except:
                continue
        
        if graph_data:
            # Drawing Area Chart using LinePlot with fill
            drawing = Drawing(400, 200)
            lp = LinePlot()
            lp.x = 50
            lp.y = 50
            lp.height = 125
            lp.width = 300
            lp.data = [graph_data]
            
            # Style & Colors - Creating the "Arc" look
            lp.lines[0].strokeColor = self.primary_color
            lp.lines[0].strokeWidth = 2
            
            # Fill logic
            lp.lines[0].symbol = makeMarker('Circle')
            lp.lines[0].symbol.fillColor = self.primary_color
            lp.lines[0].symbol.size = 4
            
            # Axis Labels
            lp.xValueAxis.valueMin = 0
            lp.xValueAxis.labelTextFormat = '%ds'
            lp.yValueAxis.valueMin = 0
            lp.yValueAxis.valueMax = 10
            lp.yValueAxis.labelTextFormat = '%d'

            # Add a filled polygon for the "Area" effect under the line
            # ReportLab LinePlot doesn't natively support simple area fill easily without custom PolyLine
            # So we stick to a clean line graph with markers for now, but rename it.
            
            drawing.add(lp)
            elements.append(drawing)
        else:
            elements.append(Paragraph("<i>No sufficient data to generate sentiment arc.</i>", self.styles['Normal']))

        elements.append(Spacer(1, 20))


        # 4. DQI Breakdown
        elements.append(Paragraph("- Decision Quality Index (DQI) Breakdown", self.styles['AegisSection']))
        
        dqi = fsir_data.get('dqi_breakdown', {})
        dqi_metrics = [
            [
                f"{dqi.get('score', 0)}", 
                str(dqi.get('correct_decisions', 0)), 
                str(dqi.get('recoverable_mistakes', 0)),
                str(dqi.get('unjustified_assumptions', 0))
            ],
            ["DQI / 100", "Correct Decisions", "Recoverable Mistakes", "Unjustified Assumptions"]
        ]
        
        dqi_table = Table(dqi_metrics, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 1.8*inch])
        dqi_table.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 30),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TEXTCOLOR', (0,0), (-1,0), self.primary_color),
            ('TEXTCOLOR', (0,1), (-1,1), colors.grey),
            ('FONTSIZE', (0,1), (-1,1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(dqi_table)
        elements.append(Spacer(1, 20))


        # 5. Integrity & Authenticity Signals
        elements.append(Paragraph("- Integrity & Authenticity Signals", self.styles['AegisSection']))
        integrity = fsir_data.get('integrity_signals', {})
        conf = integrity.get('confidence_score', 'N/A')
        signals = integrity.get('signals_observed', [])
        
        integrity_text = f"<b>Integrity Confidence: <font color='#4F46E5'>{conf}</font></b><br/><br/>"
        if signals:
             integrity_text += "• " + "<br/>• ".join(signals)
        
        elements.append(Paragraph(integrity_text, self.styles['ExecutiveBlock']))
        elements.append(Spacer(1, 20))


        # 6. Communication & Clarity Metrics
        elements.append(Paragraph("- Communication & Clarity Metrics", self.styles['AegisSection']))
        comm_stats = fsir_data.get('communication_metrics', [])
        if comm_stats:
            c_data = [["Metric", "Observation"]]
            for c in comm_stats:
                c_data.append([c.get('metric'), c.get('observation')])
            
            c_table = Table(c_data, colWidths=[3*inch, 3*inch])
            c_table.setStyle(TableStyle([
                 ('BACKGROUND', (0,0), (-1,0), self.bg_color),
                 ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
                 ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
                 ('PADDING', (0,0), (-1,-1), 8),
            ]))
            elements.append(c_table)
        elements.append(Spacer(1, 20))


        # 7. Agent Consensus Grid
        # [FIX 2] Use Paragraphs inside cells to fix rendering of formatting
        elements.append(Paragraph("- Agent Consensus Panel", self.styles['AegisSection']))
        
        consensus = fsir_data.get('agent_consensus', {})
        grid_data = [
            [
                Paragraph(f"<b>Incident Lead Agent</b><br/>{consensus.get('incident_lead', 'N/A')}", self.styles['Normal']),
                Paragraph(f"<b>Pressure Agent</b><br/>{consensus.get('pressure_agent', 'N/A')}", self.styles['Normal'])
            ],
            [
                Paragraph(f"<b>Observer Agent</b><br/>{consensus.get('observer_agent', 'N/A')}", self.styles['Normal']),
                Paragraph(f"<b>Protocol Governor</b><br/>{consensus.get('protocol_governor', 'N/A')}", self.styles['Normal'])
            ]
        ]
        
        agent_table = Table(grid_data, colWidths=[3.5*inch, 3.5*inch])
        agent_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), self.bg_color),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('GRID', (0,0), (-1,-1), 5, colors.white), 
            ('PADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(agent_table)
        elements.append(Spacer(1, 20))

        # 8. FAANG Competency Matrix
        if fsir_data.get('faang_evaluation'):
            elements.append(Paragraph("- FAANG Competency Matrix", self.styles['AegisSection']))
            
            fe = fsir_data['faang_evaluation']
            matrix_data = [
                ["Dimension", "Rating"],
                ["Communication", fe.get('communication', 'N/A')],
                ["Problem Solving", fe.get('problem_solving', 'N/A')],
                ["Technical Competency", fe.get('technical', 'N/A')],
                ["Testing", fe.get('testing', 'N/A')],
                ["System Design", fe.get('system_design', 'N/A')],
                ["Crisis Management", fe.get('crisis_management', 'N/A')]
            ]
            
            matrix_table = Table(matrix_data, colWidths=[3*inch, 3*inch])
            matrix_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), self.accent_color),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('GRID', (0,0), (-1,-1), 1, colors.grey),
                ('BACKGROUND', (0,1), (-1,-1), colors.white),
                ('ALIGN', (1,1), (-1,-1), 'CENTER'),
                ('TEXTCOLOR', (1,1), (-1,-1), self.primary_color),
                ('FONTNAME', (1,1), (-1,-1), 'Helvetica-Bold'),
            ]))
            elements.append(matrix_table)

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.read()
