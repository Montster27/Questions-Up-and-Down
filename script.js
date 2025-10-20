// Questions Up & Down - Interactive Form
class QuestionsUpDown {
    constructor() {
        this.storageKey = 'questionsUpDownData';
        this.init();
    }

    init() {
        this.loadDataFromStorage();
        this.setupAutoSave();
    }

    // Auto-save functionality
    setupAutoSave() {
        const inputs = document.querySelectorAll('textarea, select');
        inputs.forEach(input => {
            const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
            input.addEventListener(eventType, () => {
                this.autoSave();
            });
        });
    }

    // Auto-save data every time user types
    autoSave() {
        const data = this.collectFormData();
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Collect all form data
    collectFormData() {
        const data = {};
        const inputs = document.querySelectorAll('textarea, select');

        inputs.forEach(input => {
            data[input.id] = input.value;
        });

        return data;
    }


    // Load data from storage (used internally)
    loadDataFromStorage() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = data[id];

                        // If this is a "how" field, also update corresponding checkboxes
                        if (id.endsWith('-how') && data[id]) {
                            this.updateCheckboxesFromText(id, data[id]);
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error loading data from storage:', error);
        }
    }

    // Update checkboxes based on text value (for loading saved data)
    updateCheckboxesFromText(fieldId, textValue) {
        const values = textValue.split(';').map(v => v.trim());
        const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-field="${fieldId}"]`);

        checkboxes.forEach(checkbox => {
            checkbox.checked = values.includes(checkbox.value);
        });
    }

    // Clear all form data
    clearData() {
        if (confirm('Are you sure you want to clear all responses? This action cannot be undone.')) {
            const inputs = document.querySelectorAll('textarea, select');
            inputs.forEach(input => {
                input.value = '';
            });

            // Clear all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            localStorage.removeItem(this.storageKey);
            this.showFeedback('All data cleared!', 'info');
        }
    }

    // Export data as Markdown file
    exportAsMarkdown() {
        try {
            const data = this.collectFormData();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

            let markdownContent = '# Questions Up & Down - Responses\n\n';
            markdownContent += `**Generated:** ${new Date().toLocaleString()}\n\n`;
            markdownContent += '---\n\n';

            const sections = [
                { what: 'world-impact-what', how: 'world-impact-how', title: 'World Impact' },
                { what: 'exit-what', how: 'exit-how', title: 'Exit' },
                { what: 'sector-mapping-what', how: 'sector-mapping-how', title: 'Sector Mapping' },
                { what: 'competitive-market-what', how: 'competitive-market-how', title: 'Competitive Market' },
                { what: 'product-expansion-what', how: 'product-expansion-how', title: 'Market Expansion' },
                { what: 'company-what', how: 'company-how', title: 'Company' },
                { what: 'business-model-what', how: 'business-model-how', title: 'Business Model' },
                { what: 'customer-segment-what', how: 'customer-segment-how', title: 'Customer Segment' },
                { what: 'solution-what', how: 'solution-how', title: 'Solution' },
                { what: 'problem-what', how: 'problem-how', title: 'Problem' },
                { what: 'pain-scale-what', how: 'pain-scale-how', title: 'Pain Scale' },
                { what: 'product-what', how: 'product-how', title: 'Product' },
                { what: 'requirements-what', how: 'requirements-how', title: 'Requirements' },
                { what: 'design-what', how: 'design-how', title: 'Design' },
                { what: 'integrations-what', how: 'integrations-how', title: 'Integrations' },
                { what: 'production-what', how: 'production-how', title: 'Production' }
            ];

            sections.forEach(section => {
                markdownContent += `## ${section.title}\n\n`;

                const whatValue = data[section.what] || '*No response*';
                const howValue = data[section.how] || '*No response*';

                markdownContent += `**What do you know?**\n\n${whatValue}\n\n`;
                markdownContent += `**How do you know?**\n\n${howValue}\n\n`;
                markdownContent += '---\n\n';
            });

            markdownContent += '\n*Generated by Questions Up & Down Web App*\n';
            markdownContent += '*Monty Sharma and Maia Schlussel 2025*';

            const dataBlob = new Blob([markdownContent], { type: 'text/markdown' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `questions-up-down-${timestamp}.md`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showFeedback('Markdown file exported successfully!', 'success');
        } catch (error) {
            this.showFeedback('Error exporting Markdown: ' + error.message, 'error');
        }
    }

    // Export data as PDF file
    exportAsPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const data = this.collectFormData();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

            // PDF settings
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - 2 * margin;
            let yPosition = margin;

            // Helper function to add text with word wrap
            const addText = (text, fontSize = 10, isBold = false) => {
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                const lines = doc.splitTextToSize(text, maxWidth);

                lines.forEach(line => {
                    if (yPosition + 10 > pageHeight - margin) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    doc.text(line, margin, yPosition);
                    yPosition += fontSize * 0.5;
                });
            };

            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Questions Up & Down - Responses', margin, yPosition);
            yPosition += 10;

            // Add timestamp
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
            yPosition += 15;

            // Add divider line
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;

            // Define sections
            const sections = [
                { what: 'world-impact-what', how: 'world-impact-how', title: 'WORLD IMPACT' },
                { what: 'exit-what', how: 'exit-how', title: 'EXIT' },
                { what: 'sector-mapping-what', how: 'sector-mapping-how', title: 'SECTOR MAPPING' },
                { what: 'competitive-market-what', how: 'competitive-market-how', title: 'COMPETITIVE MARKET' },
                { what: 'product-expansion-what', how: 'product-expansion-how', title: 'MARKET EXPANSION' },
                { what: 'company-what', how: 'company-how', title: 'COMPANY' },
                { what: 'business-model-what', how: 'business-model-how', title: 'BUSINESS MODEL' },
                { what: 'customer-segment-what', how: 'customer-segment-how', title: 'CUSTOMER SEGMENT' },
                { what: 'solution-what', how: 'solution-how', title: 'SOLUTION' },
                { what: 'problem-what', how: 'problem-how', title: 'PROBLEM' },
                { what: 'pain-scale-what', how: 'pain-scale-how', title: 'PAIN SCALE' },
                { what: 'product-what', how: 'product-how', title: 'PRODUCT' },
                { what: 'requirements-what', how: 'requirements-how', title: 'REQUIREMENTS' },
                { what: 'design-what', how: 'design-how', title: 'DESIGN' },
                { what: 'integrations-what', how: 'integrations-how', title: 'INTEGRATIONS' },
                { what: 'production-what', how: 'production-how', title: 'PRODUCTION' }
            ];

            // Add each section
            sections.forEach((section, index) => {
                // Section title
                addText(section.title, 14, true);
                yPosition += 5;

                // What do you know?
                addText('What do you know?', 11, true);
                yPosition += 3;
                const whatValue = data[section.what] || 'No response';
                addText(whatValue, 10, false);
                yPosition += 7;

                // How do you know?
                addText('How do you know?', 11, true);
                yPosition += 3;
                const howValue = data[section.how] || 'No response';
                addText(howValue, 10, false);
                yPosition += 10;

                // Add divider line between sections (except for the last one)
                if (index < sections.length - 1) {
                    if (yPosition + 10 > pageHeight - margin) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    doc.setDrawColor(200);
                    doc.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += 10;
                }
            });

            // Add footer on last page
            yPosition += 10;
            if (yPosition + 15 > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('Generated by Questions Up & Down Web App', margin, yPosition);
            yPosition += 5;
            doc.text('Monty Sharma and Maia Schlussel 2025', margin, yPosition);

            // Save the PDF
            doc.save(`questions-up-down-${timestamp}.pdf`);

            this.showFeedback('PDF file exported successfully!', 'success');
        } catch (error) {
            this.showFeedback('Error exporting PDF: ' + error.message, 'error');
            console.error('PDF export error:', error);
        }
    }

    // Export data as readable text file
    exportAsText() {
        try {
            const data = this.collectFormData();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

            let textContent = 'QUESTIONS UP & DOWN - RESPONSES\n';
            textContent += '================================\n\n';
            textContent += `Generated: ${new Date().toLocaleString()}\n\n`;

            const fieldLabels = {
                'world-impact-what': 'WORLD IMPACT - What do you know?',
                'world-impact-how': 'WORLD IMPACT - How do you know?',
                'exit-what': 'EXIT - What do you know?',
                'exit-how': 'EXIT - How do you know?',
                'sector-mapping-what': 'SECTOR MAPPING - What do you know?',
                'sector-mapping-how': 'SECTOR MAPPING - How do you know?',
                'competitive-market-what': 'COMPETITIVE MARKET - What do you know?',
                'competitive-market-how': 'COMPETITIVE MARKET - How do you know?',
                'product-expansion-what': 'PRODUCT LINE EXPANSION - What do you know?',
                'product-expansion-how': 'PRODUCT LINE EXPANSION - How do you know?',
                'company-what': 'COMPANY - What do you know?',
                'company-how': 'COMPANY - How do you know?',
                'business-model-what': 'BUSINESS MODEL - What do you know?',
                'business-model-how': 'BUSINESS MODEL - How do you know?',
                'customer-segment-what': 'CUSTOMER SEGMENT - What do you know?',
                'customer-segment-how': 'CUSTOMER SEGMENT - How do you know?',
                'solution-what': 'SOLUTION - What do you know?',
                'solution-how': 'SOLUTION - How do you know?',
                'problem-what': 'PROBLEM - What do you know?',
                'problem-how': 'PROBLEM - How do you know?',
                'pain-scale-what': 'PAIN SCALE - What do you know?',
                'pain-scale-how': 'PAIN SCALE - How do you know?',
                'product-what': 'PRODUCT - What do you know?',
                'product-how': 'PRODUCT - How do you know?',
                'requirements-what': 'REQUIREMENTS - What do you know?',
                'requirements-how': 'REQUIREMENTS - How do you know?',
                'design-what': 'DESIGN - What do you know?',
                'design-how': 'DESIGN - How do you know?',
                'integrations-what': 'INTEGRATIONS - What do you know?',
                'integrations-how': 'INTEGRATIONS - How do you know?',
                'production-what': 'PRODUCTION - What do you know?',
                'production-how': 'PRODUCTION - How do you know?'
            };

            Object.keys(fieldLabels).forEach(key => {
                const label = fieldLabels[key];
                const value = data[key] || '[No response]';
                textContent += `${label}:\n${'-'.repeat(label.length)}\n${value}\n\n`;
            });

            textContent += '\n---\nGenerated by Questions Up & Down Web App\nMonty Sharma and Maia Schlussel 2025';

            const dataBlob = new Blob([textContent], { type: 'text/plain' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `questions-up-down-${timestamp}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showFeedback('Text file exported successfully!', 'success');
        } catch (error) {
            this.showFeedback('Error exporting text: ' + error.message, 'error');
        }
    }

    // Import file functionality
    importFile() {
        document.getElementById('file-input').click();
    }

    // Handle file import
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let data = {};

                if (file.name.endsWith('.json')) {
                    data = JSON.parse(content);
                } else if (file.name.endsWith('.txt')) {
                    // Parse text format back to data
                    data = this.parseTextFile(content);
                }

                // Load the data into the form
                Object.keys(data).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = data[id];

                        // If this is a "how" field, also update corresponding checkboxes
                        if (id.endsWith('-how') && data[id]) {
                            this.updateCheckboxesFromText(id, data[id]);
                        }
                    }
                });

                // Save to localStorage
                localStorage.setItem(this.storageKey, JSON.stringify(data));

                this.showFeedback(`File "${file.name}" imported successfully!`, 'success');
            } catch (error) {
                this.showFeedback('Error importing file: ' + error.message, 'error');
            }
        };

        reader.readAsText(file);
        // Clear the input so the same file can be imported again if needed
        event.target.value = '';
    }

    // Parse text file format back to data object
    parseTextFile(content) {
        const data = {};
        const fieldLabels = {
            'WORLD IMPACT - What do you know?': 'world-impact-what',
            'WORLD IMPACT - How do you know?': 'world-impact-how',
            'EXIT - What do you know?': 'exit-what',
            'EXIT - How do you know?': 'exit-how',
            'SECTOR MAPPING - What do you know?': 'sector-mapping-what',
            'SECTOR MAPPING - How do you know?': 'sector-mapping-how',
            'COMPETITIVE MARKET - What do you know?': 'competitive-market-what',
            'COMPETITIVE MARKET - How do you know?': 'competitive-market-how',
            'PRODUCT LINE EXPANSION - What do you know?': 'product-expansion-what',
            'PRODUCT LINE EXPANSION - How do you know?': 'product-expansion-how',
            'COMPANY - What do you know?': 'company-what',
            'COMPANY - How do you know?': 'company-how',
            'BUSINESS MODEL - What do you know?': 'business-model-what',
            'BUSINESS MODEL - How do you know?': 'business-model-how',
            'CUSTOMER SEGMENT - What do you know?': 'customer-segment-what',
            'CUSTOMER SEGMENT - How do you know?': 'customer-segment-how',
            'SOLUTION - What do you know?': 'solution-what',
            'SOLUTION - How do you know?': 'solution-how',
            'PROBLEM - What do you know?': 'problem-what',
            'PROBLEM - How do you know?': 'problem-how',
            'PAIN SCALE - What do you know?': 'pain-scale-what',
            'PAIN SCALE - How do you know?': 'pain-scale-how',
            'PRODUCT - What do you know?': 'product-what',
            'PRODUCT - How do you know?': 'product-how',
            'REQUIREMENTS - What do you know?': 'requirements-what',
            'REQUIREMENTS - How do you know?': 'requirements-how',
            'DESIGN - What do you know?': 'design-what',
            'DESIGN - How do you know?': 'design-how',
            'INTEGRATIONS - What do you know?': 'integrations-what',
            'INTEGRATIONS - How do you know?': 'integrations-how',
            'PRODUCTION - What do you know?': 'production-what',
            'PRODUCTION - How do you know?': 'production-how'
        };

        Object.keys(fieldLabels).forEach(label => {
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`${escapedLabel}:\\s*\\n-+\\s*\\n([\\s\\S]*?)(?=\\n\\n[A-Z]|\\n\\n---|\$)`, 'g');
            const match = regex.exec(content);
            if (match && match[1] && match[1].trim() !== '[No response]') {
                data[fieldLabels[label]] = match[1].trim();
            }
        });

        return data;
    }

    // Show feedback messages
    showFeedback(message, type = 'info') {
        // Remove existing feedback
        const existingFeedback = document.querySelector('.feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Create new feedback element
        const feedback = document.createElement('div');
        feedback.className = `feedback ${type}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);

        // Show feedback with animation
        setTimeout(() => {
            feedback.classList.add('show');
        }, 10);

        // Hide feedback after 3 seconds
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.remove();
                }
            }, 300);
        }, 3000);
    }

    // Get completion percentage
    getCompletionPercentage() {
        const inputs = document.querySelectorAll('textarea, select');
        let filled = 0;

        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                filled++;
            }
        });

        return Math.round((filled / inputs.length) * 100);
    }

    // Validate required fields (if needed)
    validateForm() {
        const inputs = document.querySelectorAll('textarea, select');
        const errors = [];

        inputs.forEach(input => {
            if (input.hasAttribute('required') && input.value.trim() === '') {
                errors.push(`Please fill in the ${input.id.replace('-', ' ')} field.`);
            }
        });

        return errors;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.questionsApp = new QuestionsUpDown();

    // Add checkbox options to all "how" fields
    addCheckboxOptions();
});

// Add checkbox options to all "how" fields
function addCheckboxOptions() {
    const howFields = [
        'exit-how', 'sector-mapping-how', 'competitive-market-how', 'product-expansion-how',
        'company-how', 'business-model-how', 'customer-segment-how', 'solution-how',
        'problem-how', 'pain-scale-how', 'product-how', 'requirements-how',
        'design-how', 'integrations-how', 'production-how'
    ];

    const checkboxOptions = [
        { value: 'seems logical', label: 'Seems logical' },
        { value: 'based on my experience', label: 'Based on my experience' },
        { value: 'customer interviews', label: 'Customer interviews' },
        { value: 'based on industry research', label: 'Based on industry research' }
    ];

    howFields.forEach(fieldId => {
        const textarea = document.getElementById(fieldId);
        if (textarea && !textarea.classList.contains('text-input')) {
            textarea.classList.add('text-input');

            // Create checkbox container
            const checkboxContainer = document.createElement('div');
            checkboxContainer.id = `${fieldId}-options`;
            checkboxContainer.className = 'checkbox-options';
            checkboxContainer.style.display = 'none';

            checkboxOptions.forEach(option => {
                const label = document.createElement('label');
                label.className = 'checkbox-label';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = option.value;
                checkbox.setAttribute('data-field', fieldId);

                const span = document.createElement('span');
                span.textContent = option.label;

                label.appendChild(checkbox);
                label.appendChild(span);
                checkboxContainer.appendChild(label);
            });

            // Insert after the textarea
            textarea.parentNode.insertBefore(checkboxContainer, textarea.nextSibling);
        }
    });
}

// Global functions for button clicks

function clearData() {
    window.questionsApp.clearData();
}

function exportAsMarkdown() {
    window.questionsApp.exportAsMarkdown();
}

function exportAsPDF() {
    window.questionsApp.exportAsPDF();
}

function exportAsText() {
    window.questionsApp.exportAsText();
}

function importFile() {
    window.questionsApp.importFile();
}

function handleFileImport(event) {
    window.questionsApp.handleFileImport(event);
}

// Toggle between text input and checkbox options for "how" fields
let isOptionsMode = false;

function toggleInputMode() {
    isOptionsMode = !isOptionsMode;
    const toggleBtn = document.getElementById('toggle-input-mode');

    if (isOptionsMode) {
        // Switch to options mode
        toggleBtn.textContent = 'Switch to Text';
        showCheckboxes();
    } else {
        // Switch to text mode
        toggleBtn.textContent = 'Switch to Options';
        showTextInputs();
    }
}

function showCheckboxes() {
    // Hide all textarea "how" fields and show checkbox options
    const textInputs = document.querySelectorAll('.text-input');
    const checkboxContainers = document.querySelectorAll('.checkbox-options');

    textInputs.forEach(input => {
        if (input.id.endsWith('-how')) {
            input.style.display = 'none';
        }
    });

    checkboxContainers.forEach(container => {
        container.style.display = 'block';
    });

    // Set up checkbox event listeners for auto-save
    setupCheckboxListeners();
}

function showTextInputs() {
    // Show all textarea "how" fields and hide checkbox options
    const textInputs = document.querySelectorAll('.text-input');
    const checkboxContainers = document.querySelectorAll('.checkbox-options');

    textInputs.forEach(input => {
        if (input.id.endsWith('-how')) {
            input.style.display = 'block';
        }
    });

    checkboxContainers.forEach(container => {
        container.style.display = 'none';
    });
}

function setupCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.checkbox-options input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('change', handleCheckboxChange); // Remove existing listeners
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

function handleCheckboxChange(event) {
    const fieldId = event.target.getAttribute('data-field');
    updateCheckboxValue(fieldId);
    window.questionsApp.autoSave();
}

function updateCheckboxValue(fieldId) {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-field="${fieldId}"]:checked`);
    const values = Array.from(checkboxes).map(cb => cb.value);
    const textarea = document.getElementById(fieldId);

    if (textarea) {
        textarea.value = values.join('; ');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {

    // Ctrl+E to export Markdown
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        window.questionsApp.exportAsMarkdown();
    }

    // Ctrl+Shift+E to export as text
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        window.questionsApp.exportAsText();
    }

    // Ctrl+O to import file
    if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        window.questionsApp.importFile();
    }
});

// Progress tracking
function updateProgress() {
    const percentage = window.questionsApp.getCompletionPercentage();
    console.log(`Form completion: ${percentage}%`);
}

// Optional: Add progress indicator
function addProgressIndicator() {
    const container = document.querySelector('.container');
    const progressBar = document.createElement('div');
    progressBar.innerHTML = `
        <div style="margin-bottom: 20px;">
            <label style="font-size: 14px; color: #666;">Completion Progress:</label>
            <div style="width: 100%; height: 8px; background-color: #e9ecef; border-radius: 4px; overflow: hidden;">
                <div id="progress-fill" style="height: 100%; background-color: #007bff; width: 0%; transition: width 0.3s ease;"></div>
            </div>
            <span id="progress-text" style="font-size: 12px; color: #666;">0% Complete</span>
        </div>
    `;

    container.insertBefore(progressBar, container.querySelector('.form-container'));

    // Update progress on input
    document.querySelectorAll('textarea, select').forEach(input => {
        const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
        input.addEventListener(eventType, () => {
            const percentage = window.questionsApp.getCompletionPercentage();
            document.getElementById('progress-fill').style.width = percentage + '%';
            document.getElementById('progress-text').textContent = percentage + '% Complete';
        });
    });
}

// Initialize progress indicator after DOM loads
// document.addEventListener('DOMContentLoaded', () => {
//     setTimeout(addProgressIndicator, 100);
// });

// Industry-specific question descriptions
const industryModels = {
    software: {
        'world-impact': 'What is the global impact?<br>When you exit, what lasting impact have you made?',
        'exit': 'What is the end goal of the company?<br>Will you go public, be acquired, license, etc.?',
        'sector-mapping': 'Describe the relationship between players in the industry 2 degrees from where you expect to be?<br>How will they respond?',
        'competitive-market': 'Who are the competitors that<br>sell the same/similar products? What do the users do now?',
        'product-expansion': 'What are follow-on or complementary products your<br>company can offer? Where do you go from here?',
        'company': 'What size and type of company would<br>be needed to support the business model?',
        'business-model': 'How will this make money?<br>How will customers pay for it?',
        'customer-segment': 'Define and describe the target customers.<br>Who are you selling to? Describe the smallest cohesive group that is in the greatest need for your product. List 3 different groups of potential customers',
        'solution': 'How is the product solving the problem?<br>What will the benefit to the user be?',
        'problem': 'What problem is the pain causing?',
        'pain-scale': 'On a scale from death to mild inconvenience, how<br>would you categorize the impact of the pain?',
        'product': 'What is it? What are you selling?',
        'requirements': 'What are the design constraints and requirements?<br>What does a successful product need to be or do?',
        'design': 'What is the product description<br>that falls within the requirements?',
        'integrations': 'What components/parts are in the design solution?<br>What do they do?',
        'production': 'What platforms/systems do the components use?<br>How do you make the components work?'
    },
    biotech: {
        'world-impact': 'What is the global health impact?<br>How many lives improved/saved? What diseases eliminated?',
        'exit': 'IPO, acquisition by pharma, licensing deals, or platform company?<br>Consider typical 10-15 year timeline',
        'sector-mapping': 'Map pharma companies, biotech peers, CROs, hospitals, insurers.<br>How will big pharma respond?',
        'competitive-market': 'Competing drugs/therapies, clinical trials, standard of care.<br>What treatments exist now?',
        'product-expansion': 'Indication expansion, combination therapies,<br>platform applications, geographic expansion',
        'company': 'R&D heavy organization, clinical operations,<br>regulatory expertise, commercial capabilities',
        'business-model': 'Drug sales, licensing, milestones, royalties.<br>Reimbursement strategy critical',
        'customer-segment': 'Patients (by indication), physicians,<br>payers/insurers, hospitals/clinics',
        'solution': 'Mechanism of action, clinical benefits,<br>quality of life improvements, survival benefit',
        'problem': 'Disease state, unmet medical need,<br>treatment gaps, quality of life issues',
        'pain-scale': 'Mortality/morbidity impact, patient population size,<br>current treatment satisfaction',
        'product': 'Drug/device/diagnostic, formulation,<br>delivery method, combination product?',
        'requirements': 'Efficacy targets, safety profile, delivery constraints,<br>stability, manufacturing feasibility',
        'design': 'Molecular design, formulation,<br>delivery system, dosing regimen',
        'integrations': 'CROs, CMOs, academic collaborations,<br>clinical sites, patient advocacy groups',
        'production': 'Proof of concept, preclinical data,<br>clinical endpoints, biomarkers, real-world evidence'
    },
    hardware: {
        'world-impact': 'What is the global impact?<br>How does this change daily life at scale?',
        'exit': 'What is the end goal?<br>Acquisition by tech giant, IPO, or become category leader?',
        'sector-mapping': 'Map manufacturers, distributors, retailers, complementary products.<br>How will incumbents respond?',
        'competitive-market': 'Direct competitors, substitute products, DIY solutions.<br>What do consumers use now?',
        'product-expansion': 'Product line extensions, ecosystem products,<br>service offerings, subscription models',
        'company': 'Hardware engineering, supply chain expertise,<br>retail/marketing capabilities',
        'business-model': 'Hardware sales, recurring revenue (services/subscriptions),<br>ecosystem lock-in',
        'customer-segment': 'Early adopters, mass market segments,<br>demographic/psychographic profiles',
        'solution': 'How the product solves the problem,<br>user experience benefits, lifestyle improvement',
        'problem': 'What problem is the pain causing?<br>Inefficiency, inconvenience, or impossibility?',
        'pain-scale': 'Frequency of pain, cost of current solution,<br>time wasted, safety concerns',
        'product': 'Physical product description, key features,<br>form factor, price point',
        'requirements': 'Performance specs, certifications (FCC, CE, safety),<br>cost targets, user experience',
        'design': 'Industrial design, user experience,<br>aesthetic, ergonomics, packaging',
        'integrations': 'Ecosystem compatibility (Apple, Google, Amazon),<br>smart home, companion apps',
        'production': 'Manufacturing process, scale-up strategy,<br>quality control, unit economics'
    },
    fintech: {
        'world-impact': 'What is the global financial inclusion impact?<br>How many unbanked/underbanked served?',
        'exit': 'Banking license acquisition, IPO,<br>acquisition by traditional bank, or new financial infrastructure?',
        'sector-mapping': 'Map banks, payment processors, regulators, tech companies.<br>How will traditional finance respond?',
        'competitive-market': 'Fintechs, traditional banks, credit unions,<br>informal financial services. Include regulatory advantages',
        'product-expansion': 'Additional financial products,<br>geographic expansion, embedded finance opportunities',
        'company': 'Tech talent, compliance team,<br>risk management, customer support at scale',
        'business-model': 'Transaction fees, subscription, interchange,<br>interest/float, data monetization',
        'customer-segment': 'Underbanked segments, SMBs,<br>specific demographics, geographic markets',
        'solution': 'How it improves financial access/efficiency,<br>user benefits, cost savings',
        'problem': 'Financial exclusion, inefficiency,<br>high costs, poor user experience',
        'pain-scale': 'Financial impact, frequency of pain point,<br>current alternative costs',
        'product': 'Financial product/service, key features,<br>pricing, accessibility',
        'requirements': 'Regulatory requirements, security standards,<br>uptime, transaction speed, accuracy',
        'design': 'User interface, API design,<br>integration architecture, mobile/web experience',
        'integrations': 'Banking APIs, payment rails, identity verification,<br>credit bureaus, accounting software',
        'production': 'Tech stack, infrastructure, deployment,<br>scalability, disaster recovery'
    }
};

// Function to switch industry model
function switchIndustryModel() {
    const select = document.getElementById('industry-model');
    const selectedModel = select.value;
    const modelDescriptions = industryModels[selectedModel];

    // Update all question descriptions
    Object.keys(modelDescriptions).forEach(key => {
        const questionRow = document.querySelector(`[id*="${key}-what"]`)?.closest('.question-row');
        if (questionRow) {
            const questionText = questionRow.querySelector('.question-text');
            if (questionText) {
                questionText.innerHTML = modelDescriptions[key];
            }
        }
    });
}