const pdfParse = require("pdf-parse");
const axios = require("axios");

/**
 * Extract text from a PDF file using pdf-parse
 * Can handle both file buffers and URLs (Cloudinary)
 */
const extractTextFromPDF = async (source) => {
  try {
    let buffer;

    if (typeof source === "string") {
      // Source is a URL (from Cloudinary) - download it first
      console.log("Fetching PDF from URL:", source);
      const response = await axios.get(source, {
        responseType: "arraybuffer",
        timeout: 30000, // 30 second timeout
      });
      buffer = Buffer.from(response.data);
    } else if (Buffer.isBuffer(source)) {
      // Source is already a buffer (direct file upload)
      buffer = source;
    } else {
      throw new Error("Invalid PDF source: must be URL string or Buffer");
    }

    // Parse the PDF
    const data = await pdfParse(buffer);

    return {
      text: data.text || "",
      pageCount: data.numpages || 0,
      info: data.info || {},
    };
  } catch (error) {
    console.error("PDF parsing error:", error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Clean and normalize extracted PDF text
 * Removes excessive whitespace and normalizes line breaks
 */
const cleanExtractedText = (text) => {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, " ") // Collapse multiple spaces
    .trim();
};

module.exports = { extractTextFromPDF, cleanExtractedText };
