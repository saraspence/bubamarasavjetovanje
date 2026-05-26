/**
 * <site-footer> — Light DOM web component
 * Renders the full dark "Kontakt" section with contact form, info, and copyright bar.
 */

const WEB3FORMS_ACCESS_KEY = '2ef90a17-bf08-4ff4-a11d-3b54760f4fb4';

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'contentinfo');

    const isLight = this.hasAttribute('light');
    const sectionClass = isLight ? 'section section--light' : 'section section--dark';

    this.innerHTML = `
      <div class="${sectionClass}">
        <div class="container">
          ${isLight ? '' : '<div class="section-heading"><h2>Kontakt</h2></div>'}

          <div class="contact-grid">
            <form class="contact-form" novalidate>
              <input
                type="checkbox"
                name="botcheck"
                class="contact-form__honeypot"
                tabindex="-1"
                autocomplete="off"
                aria-hidden="true"
              >
              <div class="form-field">
                <label for="footer-name">Ime i prezime</label>
                <input type="text" id="footer-name" name="name" autocomplete="name" placeholder="Vaše ime i prezime" required>
              </div>
              <div class="form-field">
                <label for="footer-email">Email</label>
                <input type="email" id="footer-email" name="email" autocomplete="email" placeholder="vas@email.com" required>
              </div>
              <div class="form-field">
                <label for="footer-message">Poruka</label>
                <textarea id="footer-message" name="message" rows="5" placeholder="Vaša poruka..." required></textarea>
              </div>
              <div>
                <button type="submit" class="btn btn--primary">Pošalji poruku</button>
              </div>
              <div class="form-status" role="status" aria-live="polite" hidden></div>
            </form>

            <div>
              <ul class="contact-info-list">
                <li>
                  <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                  <span>Bubamara Savjetovanje<br>Velika Gorica</span>
                </li>
                <!--
                <li>
                  <i class="fa-solid fa-phone" aria-hidden="true"></i>
                  <span>(000) 000-0000</span>
                </li>
                -->
                <li>
                  <i class="fa-solid fa-envelope" aria-hidden="true"></i>
                  <a href="mailto:sara.spence@bubamarasavjetovanje.hr">sara.spence@bubamarasavjetovanje.hr</a>
                </li>
                <li>
                  <i class="fa-brands fa-linkedin" aria-hidden="true"></i>
                  <a href="https://www.linkedin.com/in/sara-spence-5746643a/" rel="noopener noreferrer" target="_blank">LinkedIn</a>
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

    this._initContactForm();
  }

  _initContactForm() {
    const form = this.querySelector('.contact-form');
    const status = this.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    const showStatus = (message, type) => {
      status.textContent = message;
      status.classList.remove('form-status--success', 'form-status--error');
      if (type) status.classList.add(`form-status--${type}`);
      status.hidden = false;
    };

    const hideStatus = () => {
      status.hidden = true;
      status.textContent = '';
      status.classList.remove('form-status--success', 'form-status--error');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      hideStatus();
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      showStatus('Šaljem poruku...', null);

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData);
      payload.access_key = WEB3FORMS_ACCESS_KEY;
      payload.subject = 'Nova poruka – Bubamara Savjetovanje';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const json = await response.json();

        if (response.ok) {
          showStatus(
            'Hvala! Vaša poruka je poslana.',
            'success'
          );
          form.reset();
        } else {
          showStatus(
            'Došlo je do greške. Pokušajte ponovno.',
            'error'
          );
        }
      } catch {
        showStatus(
          'Nije moguće poslati poruku. Provjerite vezu i pokušajte ponovno.',
          'error'
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
      }
    });
  }
}

customElements.define('site-footer', SiteFooter);
