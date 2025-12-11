import React from "react";
import { Button } from "react-bootstrap";

const InviteInfo = ({ inviteCode, inviteToken }) => {
  const inviteLink = `${window.location.origin}/join-company?token=${inviteToken}`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      // Trigger a visual feedback (handled by CSS)
      const button = document.querySelector(`[data-copy-type="${type}"]`);
      button.classList.add('copied');
      setTimeout(() => button.classList.remove('copied'), 2000);
    } catch (err) {
      alert("Failed to copy to clipboard");
    }
  };

  return (
    <div className="inviteinfo-card">
      <div className="inviteinfo-header">
        <h5 className="inviteinfo-title">Share Company Access</h5>
        <p className="inviteinfo-subtitle">
          Use these to invite team members to your construction dashboard.
        </p>
      </div>

      <div className="inviteinfo-content">
        {/* Invite Code */}
        <div className="inviteinfo-item">
          <div className="inviteinfo-label">Invite Code</div>
          <div className="inviteinfo-value-section">
            <code className="inviteinfo-code">{inviteCode}</code>
            <Button
              size="sm"
              variant="outline-primary"
              className="inviteinfo-copy-btn"
              data-copy-type="code"
              onClick={() => copyToClipboard(inviteCode, 'code')}
            >
              Copy Code
            </Button>
          </div>
        </div>

        {/* Invite Link */}
        <div className="inviteinfo-item">
          <div className="inviteinfo-label">Invite Link</div>
          <div className="inviteinfo-value-section">
            <div className="inviteinfo-link-wrapper">
              <a 
                href={inviteLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inviteinfo-link"
                title="Open in new tab"
              >
                {inviteLink}
              </a>
            </div>
            <Button
              size="sm"
              variant="outline-primary"
              className="inviteinfo-copy-btn"
              data-copy-type="link"
              onClick={() => copyToClipboard(inviteLink, 'link')}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </div>

      <div className="inviteinfo-footer">
        <div className="inviteinfo-hint">
          💡 Links expire in 7 days. Generate new ones anytime.
        </div>
      </div>
    </div>
  );
};

export default InviteInfo;
