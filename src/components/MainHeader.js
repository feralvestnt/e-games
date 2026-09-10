import React from "react";
import VoucherDeskLogo from "../img/voucher-desk-logo.png";

function MainHeader() {

    return (
        <div style={{padding: 0, height: 75, borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc'}} className="relative isolate overflow-hidden">
          <div className="h-full flex items-center justify-center gap-3">
            <img src={VoucherDeskLogo} alt="Voucher Desk" style={{ width: 58, height: 58, objectFit: 'contain' }} />
            <div>
              <p className="text-xl font-bold" style={{ color: '#334155' }}>Voucher Desk</p>
            </div>
          </div>
        </div>
    );

}

export default MainHeader;
