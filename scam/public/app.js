const reportForm = document.getElementById('report-form');
const formMessage = document.getElementById('form-message');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const clearSearchButton = document.getElementById('clear-search');
const resultsContainer = document.getElementById('results');
const searchMeta = document.getElementById('search-meta');

const sanitize = (value) => {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
};

const renderReports = (reports, query = '') => {
  searchMeta.textContent = query
    ? `${reports.length} result(s) found for "${query}"`
    : `${reports.length} total report(s)`;

  if (!reports.length) {
    resultsContainer.innerHTML = '<p>No reports found.</p>';
    return;
  }

  resultsContainer.innerHTML = reports
    .map((report) => {
      const amountLost =
        report.amount_lost === null || report.amount_lost === ''
          ? 'N/A'
          : `$${Number(report.amount_lost).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;

      return `
        <article class="report">
          <h3>${sanitize(report.scam_type)} (${sanitize(report.location || 'Unknown location')})</h3>
          <p class="meta"><strong>Reporter:</strong> ${sanitize(report.reporter_name)}</p>
          <p class="meta"><strong>Incident date:</strong> ${sanitize(report.incident_date || 'Not specified')}</p>
          <p class="meta"><strong>Amount lost:</strong> ${amountLost}</p>
          <p class="meta"><strong>Contact:</strong> ${sanitize(report.contact_info || 'Not provided')}</p>
          <p>${sanitize(report.description)}</p>
        </article>
      `;
    })
    .join('');
};

const fetchReports = async (query = '') => {
  const params = new URLSearchParams();
  if (query) params.set('query', query);

  const response = await fetch(`/api/reports?${params.toString()}`);
  const data = await response.json();
  renderReports(data.reports, data.query);
};

reportForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = '';

  const formData = new FormData(reportForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit report.');
    }

    formMessage.style.color = 'green';
    formMessage.textContent = 'Report submitted successfully.';
    reportForm.reset();
    await fetchReports(searchInput.value.trim());
  } catch (error) {
    formMessage.style.color = '#c62828';
    formMessage.textContent = error.message;
  }
});

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await fetchReports(searchInput.value.trim());
});

clearSearchButton.addEventListener('click', async () => {
  searchInput.value = '';
  await fetchReports('');
});

fetchReports();
