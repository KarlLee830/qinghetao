function createFakeElement(value) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const fakeElement = document.createElement('textarea');
  // Prevent zooming on iOS
  fakeElement.style.fontSize = '12pt';
  // Reset box model
  fakeElement.style.border = '0';
  fakeElement.style.padding = '0';
  fakeElement.style.margin = '0';
  // Move element out of screen horizontally
  fakeElement.style.position = 'absolute';
  fakeElement.style[isRTL ? 'right' : 'left'] = '-9999px';
  // Move element to the same position vertically
  const yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElement.style.top = `${yPosition}px`;

  fakeElement.setAttribute('readonly', '');
  fakeElement.value = value;

  return fakeElement;
}

export  function copyToClipboard(value) {
  const container = document.body;
  const fakeElement = createFakeElement(value);
  container.appendChild(fakeElement);
  fakeElement.select();

  const selectedText = fakeElement.setSelectionRange(0, fakeElement.value.length);
  document.execCommand('copy');
  fakeElement.remove();
  return selectedText;
}
