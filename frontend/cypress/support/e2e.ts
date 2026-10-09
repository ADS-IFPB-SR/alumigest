// Configurações globais dos testes E2E do AlumiGest

declare global {
  namespace Cypress {
    interface Chainable {
      highlight(durationMs?: number): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('highlight', { prevSubject: 'element' }, (subject, durationMs = 1500) => {
  cy.wrap(subject).then(($el) => {
    const originalOutline = $el.css('outline');
    const originalBoxShadow = $el.css('box-shadow');
    $el.css({
      outline: '3px solid #0284c7',
      'box-shadow': '0 0 16px rgba(2, 132, 199, 0.8)',
      transition: 'all 0.3s ease',
    });
    setTimeout(() => {
      $el.css({
        outline: originalOutline,
        'box-shadow': originalBoxShadow,
      });
    }, durationMs);
  });
  return cy.wrap(subject);
});