if (fragmentElement) {
  // Helper to map Liferay workflow status codes/labels to portal design chips
  function getStatusConfig(statusObj) {
    if (!statusObj) {
      return { status: "In progress", statusClass: "chip-info" };
    }
    const label = (statusObj.label || "").toLowerCase();
    const code = statusObj.code;

    if (code === 0 || label === 'approved') {
      return { status: "Resolved", statusClass: "chip-green" };
    } else if (label === 'in review' || label === 'pending') {
      return { status: "In review", statusClass: "chip-amber" };
    } else if (label === 'scheduled') {
      return { status: "Scheduled", statusClass: "chip-info" };
    } else {
      return { status: "In progress", statusClass: "chip-info" };
    }
  }
  const defaultMockCases = [
    { id: "20461", type: "Transfer service", submitted: "Apr 29", status: "In progress", statusClass: "chip-info" },
    { id: "20416", type: "Meter re‑read", submitted: "Apr 26", status: "In review", statusClass: "chip-amber" },
    { id: "20388", type: "Paperless enrollment", submitted: "Apr 12", status: "Scheduled", statusClass: "chip-info" },
    { id: "20301", type: "Billing inquiry", submitted: "Mar 30", status: "Resolved", statusClass: "chip-green" },
    { id: "20245", type: "Appliance safety check", submitted: "Mar 14", status: "Resolved", statusClass: "chip-green" }
  ];

  let loadedCasesList = [];
  let activeFilter = 'all';

  const filterContainer = fragmentElement.querySelector('#cases-filter-container');
  if (filterContainer) {
    filterContainer.addEventListener('click', function (e) {
      const chip = e.target.closest('.case-filter-chip');
      if (chip) {
        filterContainer.querySelectorAll('.case-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter');
        applyFilterAndRender();
      }
    });
  }

  function applyFilterAndRender() {
    const allCases = [...loadedCasesList, ...defaultMockCases];
    let filtered = allCases;
    if (activeFilter === 'open') {
      filtered = allCases.filter(c => c.status !== 'Resolved');
    } else if (activeFilter === 'resolved') {
      filtered = allCases.filter(c => c.status === 'Resolved');
    }
    renderCasesTable(filtered);
  }

  // Load cases from Liferay Object API or localStorage fallback
  async function loadCases() {
    let apiCases = [];
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (window.Liferay && window.Liferay.authToken) {
        headers['x-csrf-token'] = window.Liferay.authToken;
      }
      const response = await fetch('/o/c/transferservicerequests/', {
        headers: headers
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.items) {
          apiCases = data.items.map(item => {
            // Map Liferay Object date/fields to case rendering format
            const createDate = item.dateCreated ? new Date(item.dateCreated) : new Date();
            const formattedDate = createDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const statusConfig = getStatusConfig(item.status);
            return {
              id: item.id || `LFR-${Math.floor(10000 + Math.random() * 90000)}`,
              type: "Transfer service",
              submitted: formattedDate,
              status: statusConfig.status,
              statusClass: statusConfig.statusClass
            };
          });
        }
      } else {
        console.warn('Liferay Object API returned error status, falling back to LocalStorage simulation.');
        apiCases = getLocalStorageCases();
      }
    } catch (e) {
      console.warn('Failed to query Liferay Object API, falling back to LocalStorage simulation.', e);
      apiCases = getLocalStorageCases();
    }

    loadedCasesList = apiCases;
    applyFilterAndRender();
  }

  function getLocalStorageCases() {
    try {
      const stored = localStorage.getItem('liferay_transfer_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map(item => {
          const submittedDate = item.submittedAt ? new Date(item.submittedAt) : new Date();
          return {
            id: item.id,
            type: "Transfer service",
            submitted: submittedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            status: "In progress",
            statusClass: "chip-info"
          };
        });
      }
    } catch (err) {
      console.error('Error loading cases from local storage', err);
    }
    return [];
  }

  function renderCasesTable(apiCases) {
    const tableBody = fragmentElement.querySelector('#cases-table-body');
    if (!tableBody) return;

    // Clear and build the table rows
    tableBody.innerHTML = '';
    
    if (apiCases.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="5" class="muted" style="text-align:center;padding:20px 0;">No active service requests found.</td>`;
      tableBody.appendChild(row);
      return;
    }

    apiCases.forEach(c => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="t-strong">SR‑${c.id}</td>
        <td>${c.type}</td>
        <td>${c.submitted}</td>
        <td><span class="chip ${c.statusClass}">${c.status}</span></td>
        <td><a class="link" href="#" onclick="event.preventDefault(); alert('Viewing case SR-${c.id} details...');">View</a></td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Format date helper for wizard review step
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  }

  // Close alert banners
  fragmentElement.addEventListener('click', function (e) {
    const closeBtn = e.target.closest('.banner .b-close');
    if (closeBtn) {
      const banner = closeBtn.closest('.banner');
      if (banner) {
        banner.style.display = 'none';
      }
    }
  });

  // Wizard state management & event listeners
  const wizardContainer = fragmentElement.querySelector('#transfer-service-wizard');
  const launcherBtn = fragmentElement.querySelector('[data-lfr-editable-id="btn-transreq-service"]');

  if (launcherBtn && wizardContainer) {
    // Show wizard on launcher click
    launcherBtn.addEventListener('click', function (e) {
      e.preventDefault();
      wizardContainer.style.display = 'block';
      goToStep('step-details');
      wizardContainer.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Navigation button routing
  fragmentElement.addEventListener('click', function (e) {
    // Next steps
    const nextBtn = e.target.closest('.btn-next-step');
    if (nextBtn) {
      const currentStepEl = nextBtn.closest('.wizard-step');
      if (validateStepInputs(currentStepEl)) {
        const nextStepId = nextBtn.getAttribute('data-next');
        if (nextStepId === 'step-review') {
          populateReviewData();
        }
        goToStep(nextStepId);
      }
      return;
    }

    // Prev steps
    const prevBtn = e.target.closest('.btn-prev-step');
    if (prevBtn) {
      const prevStepId = prevBtn.getAttribute('data-prev');
      goToStep(prevStepId);
      return;
    }

    // Cancel
    const cancelBtn = e.target.closest('.btn-cancel-wizard');
    if (cancelBtn) {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        closeWizard();
      }
      return;
    }

    // Submit request
    const submitBtn = e.target.closest('.btn-submit-wizard');
    if (submitBtn) {
      submitTransferRequest();
      return;
    }

    // Close success state
    const closeBtn = e.target.closest('.btn-close-wizard');
    if (closeBtn) {
      closeWizard();
      return;
    }
  });

  function validateStepInputs(stepElement) {
    const inputs = stepElement.querySelectorAll('input[required]');
    let isValid = true;
    inputs.forEach(input => {
      // Basic check
      if (!input.value.trim()) {
        isValid = false;
        input.classList.add('error');
        // Add error class outline or hint
        input.style.borderColor = 'var(--red)';
      } else {
        input.classList.remove('error');
        input.style.borderColor = '';
      }
    });
    if (!isValid) {
      alert('Please fill out all required fields.');
    }
    return isValid;
  }

  function goToStep(stepId) {
    // Hide all steps
    fragmentElement.querySelectorAll('.wizard-step').forEach(step => {
      step.style.display = 'none';
    });

    // Show target step
    const targetStep = fragmentElement.querySelector(`#${stepId}`);
    if (targetStep) {
      targetStep.style.display = 'block';
    }

    // Update steps indicator
    const stepsIndicator = fragmentElement.querySelector('#wizard-steps-indicator');
    const stepNumEl = fragmentElement.querySelector('#wizard-step-num');
    if (stepsIndicator) {
      const stepName = stepId.replace('step-', '');
      let stepNum = 1;
      
      const stepDivs = stepsIndicator.querySelectorAll('.step');
      stepDivs.forEach((div, idx) => {
        const dataStep = div.getAttribute('data-step');
        if (dataStep === stepName) {
          div.classList.add('active');
          div.classList.remove('done');
          stepNum = idx + 1;
        } else if (idx < stepNum - 1 || (stepName === 'review' && idx < 2) || (stepName === 'success')) {
          div.classList.remove('active');
          div.classList.add('done');
        } else {
          div.classList.remove('active', 'done');
        }
      });

      if (stepNumEl) {
        stepNumEl.textContent = stepNum > 3 ? 3 : stepNum;
      }
    }
  }

  function populateReviewData() {
    const acct = fragmentElement.querySelector('#transfer-acct').value;
    const currAddr = fragmentElement.querySelector('#transfer-current-addr').value;
    const newAddr = fragmentElement.querySelector('#transfer-new-addr').value;
    const stopDate = fragmentElement.querySelector('#transfer-stop-date').value;
    const startDate = fragmentElement.querySelector('#transfer-start-date').value;
    const email = fragmentElement.querySelector('#transfer-email').value;
    const phone = fragmentElement.querySelector('#transfer-phone').value;

    fragmentElement.querySelector('#rev-acct').textContent = acct;
    fragmentElement.querySelector('#rev-current-addr').textContent = currAddr;
    fragmentElement.querySelector('#rev-new-addr').textContent = newAddr;
    fragmentElement.querySelector('#rev-stop-date').textContent = formatDate(stopDate);
    fragmentElement.querySelector('#rev-start-date').textContent = formatDate(startDate);
    fragmentElement.querySelector('#rev-contact').textContent = `${email} / ${phone}`;
  }

  async function submitTransferRequest() {
    const payload = {
      accountNumber: fragmentElement.querySelector('#transfer-acct').value,
      currentAddress: fragmentElement.querySelector('#transfer-current-addr').value,
      newAddress: fragmentElement.querySelector('#transfer-new-addr').value,
      preferredStopDate: fragmentElement.querySelector('#transfer-stop-date').value,
      preferredStartDate: fragmentElement.querySelector('#transfer-start-date').value,
      contactEmail: fragmentElement.querySelector('#transfer-email').value,
      contactPhone: fragmentElement.querySelector('#transfer-phone').value
    };

    let caseId = '';
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (window.Liferay && window.Liferay.authToken) {
        headers['x-csrf-token'] = window.Liferay.authToken;
      }
      const response = await fetch('/o/c/transferservicerequests/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        caseId = result.id;
      } else {
        console.warn('Liferay Object POST API returned error, falling back to LocalStorage simulation.');
        caseId = saveToLocalStorage(payload);
      }
    } catch (e) {
      console.warn('Failed to post to Liferay Object API, falling back to LocalStorage simulation.', e);
      caseId = saveToLocalStorage(payload);
    }

    // Show success view
    const successCaseIdEl = fragmentElement.querySelector('#success-case-id');
    if (successCaseIdEl) {
      successCaseIdEl.textContent = `SR-${caseId}`;
    }
    
    goToStep('step-success');

    // Reload the table
    loadCases();
  }

  function saveToLocalStorage(payload) {
    const randomId = Math.floor(20462 + Math.random() * 9000);
    const item = {
      id: randomId.toString(),
      submittedAt: new Date().toISOString(),
      ...payload
    };

    try {
      const stored = localStorage.getItem('liferay_transfer_requests');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(item); // Add to front so it shows on top
      localStorage.setItem('liferay_transfer_requests', JSON.stringify(list));
    } catch (err) {
      console.error('Error saving case to local storage', err);
    }

    return randomId;
  }

  function closeWizard() {
    // Clear fields
    const inputs = wizardContainer.querySelectorAll('input');
    inputs.forEach(input => {
      input.value = '';
      input.classList.remove('error');
      input.style.borderColor = '';
    });
    
    wizardContainer.style.display = 'none';
  }

  // Initial load
  loadCases();
}
