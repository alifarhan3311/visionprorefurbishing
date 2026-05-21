const RMA = require('../models/RMA');
const { sendSMS } = require('../utils/smsService');
const sendEmail = require('../utils/sendEmail');

exports.createRMA = async (req, res) => {
  try {
    const rma = new RMA({
      ...req.body,
      user: req.user._id,
      userId: req.user._id.toString()
    });
    await rma.save();

    // Populate user to get name, email, companyName
    await rma.populate('user', 'name email companyName phone');

    // Send Email to Admin
    const adminEmail = process.env.MAIL_FROM_ADDRESS || 'admin@visionpro.com';
    const adminHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; border-bottom: 2px solid #0055A5; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #0055A5; margin: 0; font-size: 24px; font-weight: 800;">Vision Pro LCD</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Admin Notifications Center</p>
        </div>
        
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">
          A new <strong>RMA / Order Return Request</strong> has been submitted by <strong>${rma.user?.name || 'Dealer'}</strong> (${rma.user?.email || 'N/A'}).
        </p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; font-weight: 700;">RMA Ticket Details</h4>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;"><strong>RMA ID:</strong> #${rma._id.toString().toUpperCase()}</p>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;"><strong>Dealer/Company:</strong> ${rma.user?.companyName || rma.user?.name || 'N/A'}</p>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;"><strong>Verification Method:</strong> ${rma.searchMethod?.toUpperCase()} (${rma.searchValue})</p>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;"><strong>Item Details:</strong> ${rma.itemDetails || 'N/A'}</p>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;"><strong>Return Reason:</strong> <span style="color: #b91c1c; font-weight: 700;">${rma.reason}</span></p>
        </div>

        <h4 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px; font-size: 14px; font-weight: 700;">Dealer Description</h4>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          ${rma.description || 'No description provided.'}
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <a href="http://localhost:5173/admin/rma" style="background-color: #0055A5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(0,85,165,0.2);">Review in Admin RMA Console</a>
        </div>
        
         <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
           <p style="margin: 0;">Vision Pro LCD Portal | Office: 7215 Goreway Dr #1c27 | Mississauga, ON L4T 2T9</p>
           <p style="margin: 0;">Warehouse: O2 Lcd Refurbishing | 14 Automatic Rd, U34 | Brampton, ON L6S 5N5</p>
         </div>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `[New RMA Claim] - #${rma._id.toString().slice(-6).toUpperCase()} from ${rma.user?.companyName || rma.user?.name}`,
      html: adminHtml
    });

    res.status(201).json({ success: true, data: rma });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getRMAs = async (req, res) => {
  try {
    const rmas = await RMA.find().populate('user', 'name email companyName phone').sort('-createdAt');
    res.status(200).json({ success: true, data: rmas });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateRMAStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rma = await RMA.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email companyName phone');

    if (!rma) {
      return res.status(404).json({ success: false, error: 'RMA not found' });
    }

    // Send SMS Notification
    if (rma.phone || (rma.user && rma.user.phone)) {
      const recipientPhone = rma.phone || rma.user.phone;
      await sendSMS(recipientPhone, `MobileSentrix: Your RMA ticket status has been updated to: ${status}.`);
    }

    // Send Email to User on status update
    if (rma.user && rma.user.email) {
      const statusHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="text-align: center; border-bottom: 2px solid #0055A5; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="color: #0055A5; margin: 0; font-size: 24px; font-weight: 800;">Vision Pro LCD</h2>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">RMA & Return Updates</p>
          </div>
          
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Dear ${rma.user.name || 'Valued Partner'},</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Your RMA/Return request status has been updated. Please find the details below:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0055A5;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;"><strong>RMA Ticket ID:</strong> #${rma._id.toString().toUpperCase()}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;"><strong>Item Details:</strong> ${rma.itemDetails || 'N/A'}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;"><strong>Return Reason:</strong> ${rma.reason || 'N/A'}</p>
            <p style="margin: 0; font-size: 14px; color: #475569;"><strong>New Status:</strong> <span style="background-color: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase;">${status}</span></p>
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            If your status is <strong>Processing</strong>, our technicians are currently inspecting the returned goods. Once approved, the appropriate refund or replacement credits will be applied to your account.
          </p>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Thank you for partnering with Vision Pro LCD.
          </p>
        </div>
      `;

      await sendEmail({
        to: rma.user.email,
        subject: `Vision Pro LCD - RMA Ticket #${rma._id.toString().slice(-6).toUpperCase()} Status: ${status}`,
        html: statusHtml
      });
    }

    res.status(200).json({ success: true, data: rma });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
