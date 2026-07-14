package com.portico.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.portico.backend.entity.Bill;
import com.portico.backend.entity.Payment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    public byte[] generateMaintenanceReceipt(Bill bill, Payment payment) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Set Title & Font
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("PORTICO MAINTENANCE PAYMENT RECEIPT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            // Subtitle
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Paragraph sub = new Paragraph("Official Payment Acknowledgment Statement", metaFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(20);
            document.add(sub);

            // Receipt Details Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(20);

            addTableCell(table, "Bill Reference ID:", String.valueOf(bill.getId()));
            addTableCell(table, "Flat Details:", "Block " + bill.getFlat().getBlock() + " - " + bill.getFlat().getFlatNumber());
            addTableCell(table, "Resident Email:", bill.getFlat().getResident() != null ? bill.getFlat().getResident().getEmail() : "N/A");
            addTableCell(table, "Resident Name:", bill.getFlat().getResident() != null ? bill.getFlat().getResident().getFirstName() + " " + bill.getFlat().getResident().getLastName() : "N/A");
            addTableCell(table, "Billing Month:", bill.getBillingMonth());
            addTableCell(table, "Due Date:", bill.getDueDate().toString());
            addTableCell(table, "Paid Date:", payment.getPaidAt() != null ? payment.getPaidAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "N/A");
            addTableCell(table, "Razorpay Order ID:", payment.getRazorpayOrderId());
            addTableCell(table, "Razorpay Payment ID:", payment.getRazorpayPaymentId());
            addTableCell(table, "Payment Amount:", "INR " + bill.getAmount().toString());
            addTableCell(table, "Payment Status:", "SUCCESSFUL / PAID");

            document.add(table);

            // Footer
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9);
            Paragraph footer = new Paragraph("This is an electronically generated receipt for maintenance services. No signature required.", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(40);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    private void addTableCell(PdfPTable table, String header, String value) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        PdfPCell cell1 = new PdfPCell(new Phrase(header, headerFont));
        cell1.setPadding(6);
        table.addCell(cell1);

        PdfPCell cell2 = new PdfPCell(new Phrase(value, valueFont));
        cell2.setPadding(6);
        table.addCell(cell2);
    }
}
