const Buyback = require('../models/Buyback');
const { sendSMS } = require('../utils/smsService');
const sendEmail = require('../utils/sendEmail');

exports.createBuyback = async (req, res) => {
  try {
    const buyback = new Buyback({
      ...req.body,
      user: req.user._id,
      phone: req.user.phone
    });
    await buyback.save();

    // Populate user to get name/email
    await buyback.populate('user', 'name email companyName');

    // Send Email to User
    if (buyback.user && buyback.user.email) {
      const screensList = buyback.screens.map(s => `
        <li>${s.brand} - ${s.model || 'N/A'} (${s.condition || 'N/A'}) - Qty: ${s.qty}</li>
      `).join('');

      const userHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800;">Vision Pro LCD</h2>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">LCD Buyback Program</p>
          </div>
          
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Dear ${buyback.user.name || 'Valued Partner'},</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Thank you for submitting a new LCD Buyback request. We have successfully registered your request in our portal.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; font-weight: 700;">Buyback Ticket Details</h4>
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;"><strong>Ticket ID:</strong> ${buyback._id}</p>
            <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Estimated Value:</strong> <span style="color: #059669; font-weight: 700;">$${Number(buyback.estimatedValue || 0).toFixed(2)}</span></p>
          </div>

          <h4 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px; font-size: 14px; font-weight: 700;">Screens Submitted</h4>
          <ul style="color: #475569; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0 0 20px 0;">
            ${screensList}
          </ul>
          
          <p style="color: #475569; font-size: 13px; background-color: #fffbeb; border: 1px solid #fef3c7; color: #b45309; padding: 12px; border-radius: 8px; margin-bottom: 25px;">
            <strong>Next Steps:</strong> Please print your shipping label and send your screens to our facility for physical testing and confirmation.
          </p>

          <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="margin: 0;">Vision Pro LCD Portal | 7215 Goreway Dr #1c27 | Mississauga, ON L4T 2T9</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: buyback.user.email,
        subject: 'Vision Pro LCD - Buyback Ticket Submitted',
        html: userHtml
      });
    }

    // Send Email to Admin
    const adminEmail = process.env.MAIL_FROM_ADDRESS || 'admin@visionpro.com';
    const screensListAdmin = buyback.screens.map(s => `
      <li>${s.brand} - ${s.model || 'N/A'} (${s.condition || 'N/A'}) - Qty: ${s.qty}</li>
    `).join('');

    const adminHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800;">Vision Pro LCD</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Admin Notifications Center</p>
        </div>
        
        <p style="color: #334155; font-size: 15px;">A new LCD Buyback request has been submitted by <strong>${buyback.user?.name}</strong> (${buyback.user?.email}).</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Ticket Info</h4>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;"><strong>Ticket ID:</strong> ${buyback._id}</p>
          <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Estimated Value:</strong> $${Number(buyback.estimatedValue || 0).toFixed(2)}</p>
        </div>

        <h4 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">Screens Details</h4>
        <ul style="color: #475569; font-size: 14px; line-height: 1.6; padding-left: 20px;">
          ${screensListAdmin}
        </ul>

        <div style="margin-top: 30px; text-align: center;">
          <a href="http://localhost:5173/admin/buyback" style="background-color: #1e3a8a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Review in Admin Panel</a>
        </div>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `New Buyback Ticket - ${buyback.user?.name || 'Dealer'}`,
      html: adminHtml
    });

    res.status(201).json({ success: true, data: buyback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getBuybacks = async (req, res) => {
  try {
    const buybacks = await Buyback.find().populate('user', 'name email companyName').sort('-createdAt');
    res.status(200).json({ success: true, data: buybacks });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMyBuybacks = async (req, res) => {
  try {
    const buybacks = await Buyback.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: buybacks });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateBuybackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const buyback = await Buyback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email companyName');

    if (!buyback) {
      return res.status(404).json({ success: false, error: 'Buyback not found' });
    }

    // Send SMS Notification
    if (buyback.phone) {
      await sendSMS(buyback.phone, `MobileSentrix: Your LCD Buyback ticket status has been updated to: ${status}.`);
    }

    // Send Email to User on status update
    if (buyback.user && buyback.user.email) {
      const statusHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #0055A5; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="color: #0055A5; margin: 0; font-size: 24px; font-weight: 800;">Vision Pro LCD</h2>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">LCD Buyback Updates</p>
          </div>
          
          <p style="color: #334155; font-size: 15px;">Dear ${buyback.user.name || 'Valued Partner'},</p>
          <p style="color: #334155; font-size: 15px;">Your LCD Buyback request status has been updated. Please find the details below:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0055A5;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;"><strong>Ticket ID:</strong> ${buyback._id}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;"><strong>New Status:</strong> <span style="background-color: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase;">${status}</span></p>
            <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Estimated Value:</strong> $${Number(buyback.estimatedValue || 0).toFixed(2)}</p>
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            If your status is <strong>Approved</strong> or <strong>Payment Confirmed</strong>, the appropriate credits will be applied to your B2B account profile.
          </p>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Thank you for partnering with Vision Pro LCD.
          </p>
        </div>
      `;

      await sendEmail({
        to: buyback.user.email,
        subject: `Vision Pro LCD - Buyback Ticket Status: ${status}`,
        html: statusHtml
      });
    }

    res.status(200).json({ success: true, data: buyback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
