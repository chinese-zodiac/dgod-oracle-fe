import React from 'react';
import { LINK_PRIVACY_POLICY, LINK_TERMS_OF_USE, SOCIAL_GITHUB, SOCIAL_TELEGRAM, SOCIAL_TWITTER } from '../../constants/social';
import CZPower from '../../public/static/assets/images/czpower.png';

function Footer() {
  return (<footer id="footer" className="footer pb-7 mt-5" style={{ position: "relative" }}>
    <div className="content has-text-centered">
      <div>
        <a className="m-2" href={SOCIAL_TELEGRAM} target="_blank">
          <span className="icon"><i className="fa-brands fa-telegram"></i></span>
        </a>
        <a className="m-2" href={SOCIAL_TWITTER} target="_blank">
          <span className="icon"><i className="fa-brands fa-twitter"></i></span>
        </a>
        <a className="m-2" href={SOCIAL_GITHUB} target="_blank">
          <span className="icon"><i className="fa-brands fa-github"></i></span>
        </a>
      </div>
      <p className='pb-6'>
        v0.1.19
      </p>
      <p>
        <a style={{ color: 'cyan' }} href={LINK_TERMS_OF_USE}>Terms of Use</a>
      </p>
      <p>
        <a style={{ color: 'cyan' }} href={LINK_PRIVACY_POLICY}>
          Privacy Policy
        </a>
      </p>
      <a href="https://czodiac.com"><img src={CZPower} alt="Powered by CZodiac" style={{ maxWidth: "180px", marginTop: '100px' }} /></a>
    </div>
  </footer >);
}

export default Footer;