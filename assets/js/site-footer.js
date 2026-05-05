/**
 * <site-footer> — Light DOM web component
 * Renders the full dark "Kontakt" section with contact form, info, and copyright bar.
 */
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'contentinfo');

    this.innerHTML = `
      <div class="section section--dark">
        <div class="container">
          <div class="section-heading">
            <h2>Kontakt</h2>
          </div>

          <div class="contact-grid">
            <form class="contact-form" method="post" action="#" novalidate>
              <div class="form-field">
                <label for="footer-name">Ime i prezime</label>
                <input type="text" id="footer-name" name="name" autocomplete="name" placeholder="Vaše ime i prezime">
              </div>
              <div class="form-field">
                <label for="footer-email">Email</label>
                <input type="email" id="footer-email" name="email" autocomplete="email" placeholder="vas@email.com">
              </div>
              <div class="form-field">
                <label for="footer-message">Poruka</label>
                <textarea id="footer-message" name="message" rows="5" placeholder="Vaša poruka..."></textarea>
              </div>
              <div>
                <button type="submit" class="btn btn--primary">Pošalji poruku</button>
              </div>
            </form>

            <div>
              <ul class="contact-info-list">
                <li>
                  <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                  <span>Bubamara Savjetovanje<br>Velika Gorica</span>
                </li>
                <li>
                  <i class="fa-solid fa-phone" aria-hidden="true"></i>
                  <span>(000) 000-0000</span>
                </li>
                <li>
                  <i class="fa-solid fa-envelope" aria-hidden="true"></i>
                  <a href="mailto:information@untitled.tld">information@untitled.tld</a>
                </li>
                <li>
                  <i class="fa-brands fa-linkedin" aria-hidden="true"></i>
                  <a href="#" rel="noopener noreferrer">LinkedIn</a>
                </li>
                <li>
                  <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
                  <a href="#" rel="noopener noreferrer">Facebook</a>
                </li>
                <li>
                  <i class="fa-brands fa-instagram" aria-hidden="true"></i>
                  <a href="#" rel="noopener noreferrer">Instagram</a>
                </li>
              </ul>
            </div>
          </div>

          <div class="footer-bar">
            <span>&copy; 2026 Bubamara Savjetovanje. Sva prava pridržana.</span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('site-footer', SiteFooter);
