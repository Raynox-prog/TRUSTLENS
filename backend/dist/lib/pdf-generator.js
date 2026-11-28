"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportPdfBuffer = generateReportPdfBuffer;
const pdf_lib_1 = require("pdf-lib");
const types_1 = require("./types");
const utils_1 = require("./utils");
function sanitizePdfText(input) {
    // StandardFonts.Helvetica supports WinAnsi (Latin-1); replace non-WinAnsi symbols cleanly
    return input
        .replace(/₹/g, "INR ")
        .replace(/→/g, "->")
        .replace(/…/g, "...")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[—–]/g, "-")
        .replace(/×/g, "x")
        .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, " ");
}
function wrapText(text, font, fontSize, maxWidth) {
    const clean = sanitizePdfText(text);
    const paragraphs = clean.split("\n");
    const lines = [];
    for (const para of paragraphs) {
        const words = para.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
            lines.push("");
            continue;
        }
        let current = "";
        for (const word of words) {
            const test = current ? `${current} ${word}` : word;
            if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
                current = test;
            }
            else {
                if (current)
                    lines.push(current);
                // Break overly long URLs/tokens safely
                if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
                    let chunk = "";
                    for (const ch of word) {
                        if (font.widthOfTextAtSize(chunk + ch, fontSize) <= maxWidth) {
                            chunk += ch;
                        }
                        else {
                            if (chunk)
                                lines.push(chunk);
                            chunk = ch;
                        }
                    }
                    current = chunk;
                }
                else {
                    current = word;
                }
            }
        }
        if (current)
            lines.push(current);
    }
    return lines;
}
async function generateReportPdfBuffer(report) {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    pdfDoc.setTitle(`SHIELDLY Investigation Report - ${report.id}`);
    pdfDoc.setAuthor("SHIELDLY AI Cybersecurity Platform");
    pdfDoc.setSubject("Scam & Phishing Threat Investigation Report");
    const fontRegular = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const PAGE_W = 595.28; // A4
    const PAGE_H = 841.89;
    const MARGIN = 46;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const COLOR_DEEP_FOREST = (0, pdf_lib_1.rgb)(16 / 255, 43 / 255, 34 / 255); // #102B22
    const COLOR_FOREST = (0, pdf_lib_1.rgb)(23 / 255, 61 / 255, 48 / 255); // #173D30
    const COLOR_CREAM = (0, pdf_lib_1.rgb)(240 / 255, 229 / 255, 208 / 255); // #F0E5D0
    const COLOR_PURPLE = (0, pdf_lib_1.rgb)(146 / 255, 87 / 255, 246 / 255); // #9257F6
    const COLOR_TEXT_DARK = (0, pdf_lib_1.rgb)(18 / 255, 34 / 255, 28 / 255);
    const COLOR_TEXT_MUTED = (0, pdf_lib_1.rgb)(86 / 255, 104 / 255, 96 / 255);
    const COLOR_BORDER = (0, pdf_lib_1.rgb)(216 / 255, 206 / 255, 188 / 255);
    const COLOR_WHITE = (0, pdf_lib_1.rgb)(1, 1, 1);
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H;
    const addNewPage = () => {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        // Top thin brand accent bar on continuation pages
        page.drawRectangle({
            x: 0,
            y: PAGE_H - 12,
            width: PAGE_W,
            height: 12,
            color: COLOR_FOREST,
        });
        y = PAGE_H - 48;
    };
    const ensureSpace = (neededHeight) => {
        if (y - neededHeight < MARGIN + 26) {
            addNewPage();
        }
    };
    // Header Banner
    const headerH = 96;
    page.drawRectangle({
        x: 0,
        y: PAGE_H - headerH,
        width: PAGE_W,
        height: headerH,
        color: COLOR_DEEP_FOREST,
    });
    page.drawRectangle({
        x: 0,
        y: PAGE_H - headerH,
        width: PAGE_W,
        height: 4,
        color: COLOR_PURPLE,
    });
    page.drawText("SHIELDLY", {
        x: MARGIN,
        y: PAGE_H - 42,
        size: 22,
        font: fontBold,
        color: COLOR_CREAM,
    });
    page.drawText("THINK BEFORE YOU CLICK  |  CYBERSECURITY INVESTIGATION REPORT", {
        x: MARGIN,
        y: PAGE_H - 62,
        size: 8.5,
        font: fontBold,
        color: (0, pdf_lib_1.rgb)(185 / 255, 169 / 255, 233 / 255),
    });
    page.drawText(sanitizePdfText(`Report ID: ${report.id}`), {
        x: MARGIN,
        y: PAGE_H - 78,
        size: 8,
        font: fontRegular,
        color: (0, pdf_lib_1.rgb)(184 / 255, 198 / 255, 187 / 255),
    });
    y = PAGE_H - headerH - 26;
    // Risk Score Summary Card
    const cardH = 88;
    page.drawRectangle({
        x: MARGIN,
        y: y - cardH,
        width: CONTENT_W,
        height: cardH,
        color: COLOR_CREAM,
        borderColor: COLOR_BORDER,
        borderWidth: 1,
    });
    // Purple score badge on left of summary card
    page.drawRectangle({
        x: MARGIN + 12,
        y: y - cardH + 12,
        width: 112,
        height: cardH - 24,
        color: COLOR_PURPLE,
    });
    page.drawText(`${report.riskScore} / 100`, {
        x: MARGIN + 24,
        y: y - 44,
        size: 20,
        font: fontBold,
        color: COLOR_WHITE,
    });
    page.drawText((0, types_1.riskLevelLabel)(report.riskLevel).toUpperCase(), {
        x: MARGIN + 24,
        y: y - 64,
        size: 8.5,
        font: fontBold,
        color: COLOR_CREAM,
    });
    const metaX = MARGIN + 140;
    page.drawText(sanitizePdfText(`Type: ${report.analysisType.toUpperCase()}   |   Confidence: ${report.confidence.toUpperCase()}   |   Duration: ${(0, utils_1.formatDuration)(report.durationMs)}`), {
        x: metaX,
        y: y - 26,
        size: 8.5,
        font: fontBold,
        color: COLOR_FOREST,
    });
    page.drawText(sanitizePdfText(`Generated: ${(0, utils_1.formatTimestamp)(report.createdAt)}`), {
        x: metaX,
        y: y - 42,
        size: 8.5,
        font: fontRegular,
        color: COLOR_TEXT_MUTED,
    });
    const engineLines = wrapText(`Engine: ${report.metadata.engineLabel}`, fontRegular, 8.5, CONTENT_W - 152);
    engineLines.slice(0, 2).forEach((line, idx) => {
        page.drawText(line, {
            x: metaX,
            y: y - 58 - idx * 12,
            size: 8.5,
            font: fontRegular,
            color: COLOR_TEXT_DARK,
        });
    });
    y -= cardH + 22;
    const drawSectionTitle = (title) => {
        ensureSpace(34);
        page.drawText(sanitizePdfText(title.toUpperCase()), {
            x: MARGIN,
            y,
            size: 10.5,
            font: fontBold,
            color: COLOR_FOREST,
        });
        page.drawLine({
            start: { x: MARGIN, y: y - 5 },
            end: { x: PAGE_W - MARGIN, y: y - 5 },
            thickness: 1,
            color: COLOR_PURPLE,
        });
        y -= 20;
    };
    const drawParagraph = (text, opts) => {
        const size = opts?.size ?? 10;
        const font = opts?.bold ? fontBold : fontRegular;
        const color = opts?.color ?? COLOR_TEXT_DARK;
        const indent = opts?.indent ?? 0;
        const lines = wrapText(text, font, size, CONTENT_W - indent);
        const lineHeight = size + 4.5;
        for (const line of lines) {
            ensureSpace(lineHeight + 4);
            if (line) {
                page.drawText(line, {
                    x: MARGIN + indent,
                    y,
                    size,
                    font,
                    color,
                });
            }
            y -= lineHeight;
        }
        y -= 6;
    };
    // Verdict & Summary
    drawSectionTitle("Verdict & Executive Summary");
    drawParagraph(report.verdict, { bold: true, size: 11, color: COLOR_DEEP_FOREST });
    drawParagraph(report.summary, { size: 9.8 });
    // Input Preview
    drawSectionTitle("Submitted Item Preview");
    drawParagraph(report.inputSummary, { size: 9.2, color: COLOR_TEXT_MUTED });
    // Detected Threats
    drawSectionTitle(`Detected Threats (${report.detectedThreats.length})`);
    if (report.detectedThreats.length === 0) {
        drawParagraph("No overt threat signatures were triggered. Caution: absence of warning signs does not automatically prove an item is legitimate.", { size: 9.5, color: COLOR_TEXT_MUTED });
    }
    else {
        report.detectedThreats.forEach((threat, idx) => {
            ensureSpace(62);
            drawParagraph(`${idx + 1}. ${threat.type}  [${threat.severity.toUpperCase()} SEVERITY]`, { bold: true, size: 10, color: COLOR_DEEP_FOREST });
            drawParagraph(`Evidence: "${threat.evidence}"`, {
                size: 9,
                color: COLOR_PURPLE,
                indent: 12,
            });
            drawParagraph(`Explanation: ${threat.explanation}`, {
                size: 9.2,
                color: COLOR_TEXT_DARK,
                indent: 12,
            });
        });
    }
    // Recommended Actions
    drawSectionTitle("Recommended Safety Actions");
    report.recommendations.forEach((rec, idx) => {
        drawParagraph(`${idx + 1}. ${rec}`, { size: 9.5, indent: 6 });
    });
    // Limitations
    if (report.limitations.length > 0) {
        drawSectionTitle("Transparency & Limitations");
        report.limitations.forEach((lim) => {
            drawParagraph(`- ${lim}`, { size: 8.8, color: COLOR_TEXT_MUTED, indent: 6 });
        });
    }
    // Add footers to all pages
    const pages = pdfDoc.getPages();
    pages.forEach((p, idx) => {
        p.drawLine({
            start: { x: MARGIN, y: 34 },
            end: { x: PAGE_W - MARGIN, y: 34 },
            thickness: 0.5,
            color: COLOR_BORDER,
        });
        p.drawText("SHIELDLY — Think Before You Click. Automated assessment assists human judgment and never guarantees legitimacy.", {
            x: MARGIN,
            y: 20,
            size: 7.5,
            font: fontRegular,
            color: COLOR_TEXT_MUTED,
        });
        p.drawText(`Page ${idx + 1} of ${pages.length}`, {
            x: PAGE_W - MARGIN - 55,
            y: 20,
            size: 7.5,
            font: fontBold,
            color: COLOR_FOREST,
        });
    });
    return pdfDoc.save();
}
