import React from 'react';
import { Button } from 'hoi-poi-ui';
import { bridge } from 'fm-bridge';

import './style.scss';

function Signature({ label, value, onChange, summary }) {
  const onClickSign = () => {
    bridge
      .openSignatureView()
      .then((res) => onChange(res))
      .catch((err) => console.warn(err));
  };

  return (
    <div className="signature">
      {summary && <div className="signature-label">{label}</div>}
      <div className="signature-image-container">
        {value && <img className="signature-image" src={`data:image/png;base64,${value}`} alt="" />}
      </div>

      {!summary && (
        <Button className="signature-button" color="primary" onClick={onClickSign}>
          SIGN
        </Button>
      )}
    </div>
  );
}

export default Signature;
