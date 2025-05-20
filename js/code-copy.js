document.addEventListener('DOMContentLoaded', function() {
    // Verarbeiten von Code-Blöcken im Hauptdokument
    setupCopyButtons(document);
    
    // Verarbeiten von Code-Blöcken im iframe
    try {
        const iframe = document.querySelector('iframe[name="contentFrame"]');
        if (iframe) {
            // Einrichtung der Kopierknöpfe nach dem Laden des iframes
            iframe.addEventListener('load', function() {
                if (this.contentDocument) {
                    setupCopyButtons(this.contentDocument);
                }
            });
            
            // Versuchen, Kopierknöpfe im bereits geladenen iframe einzurichten
            if (iframe.contentDocument) {
                setupCopyButtons(iframe.contentDocument);
            }
        }
    } catch (e) {
        console.error('Zugriff auf iframe-Inhalt nicht möglich:', e);
    }
});

function setupCopyButtons(doc) {
    // Alle Code-Blöcke finden
    const preElements = doc.querySelectorAll('pre');
    
    preElements.forEach(function(pre) {
        // Wenn pre bereits in einem code-container ist, nicht weiter verarbeiten
        if (pre.parentElement.classList.contains('code-container')) {
            return;
        }
        
        // Code-Container erstellen
        const container = doc.createElement('div');
        container.className = 'code-container';
        pre.parentNode.insertBefore(container, pre);
        container.appendChild(pre);
        
        // Kopierknopf erstellen
        const copyButton = doc.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Code kopieren';
        copyButton.style.position = 'absolute';
        copyButton.style.top = '5px';
        copyButton.style.right = '5px';
        copyButton.style.zIndex = '100';
        copyButton.style.padding = '5px 10px';
        copyButton.style.fontSize = '12px';
        copyButton.style.background = '#e8f0fe';
        copyButton.style.border = '1px solid #d2e3fc';
        copyButton.style.borderRadius = '4px';
        copyButton.style.cursor = 'pointer';
        
        // Event-Listener für Klick hinzufügen
        copyButton.addEventListener('click', function() {
            // Code-Inhalt abrufen
            const codeElement = pre.querySelector('code');
            const code = codeElement ? codeElement.textContent : pre.textContent;
            
            // In die Zwischenablage kopieren
            navigator.clipboard.writeText(code).then(function() {
                // Erfolgsfeedback
                copyButton.textContent = 'Kopiert!';
                copyButton.style.background = '#d2e3fc';
                copyButton.style.color = '#1a73e8';
                copyButton.style.borderColor = '#1a73e8';
                
                // Knopftext nach 2 Sekunden zurücksetzen
                setTimeout(function() {
                    copyButton.textContent = 'Code kopieren';
                    copyButton.style.background = '#e8f0fe';
                    copyButton.style.color = '';
                    copyButton.style.borderColor = '#d2e3fc';
                }, 2000);
            }).catch(function(err) {
                console.error('Kopieren fehlgeschlagen:', err);
                copyButton.textContent = 'Kopieren fehlgeschlagen';
                setTimeout(function() {
                    copyButton.textContent = 'Code kopieren';
                }, 2000);
            });
        });
        
        // Knopf zum Container hinzufügen
        container.appendChild(copyButton);
    });
} 