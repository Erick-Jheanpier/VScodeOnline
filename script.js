require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs"
  }
});

require(["vs/editor/editor.main"], function () {

  const htmlModel = monaco.editor.createModel("<h1>hola mundo</h1>", "html");
  const cssModel = monaco.editor.createModel("", "css");
  const jsModel = monaco.editor.createModel("console.log('erick')", "javascript");

  const options = {
    theme: "vs-dark",
    automaticLayout: true,
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    quickSuggestions: true,
    suggestOnTriggerCharacters: true
  };

  const htmlEditor = monaco.editor.create(
    document.getElementById("htmlEditor"),
    { model: htmlModel, ...options }
  );
  const cssEditor = monaco.editor.create(
    document.getElementById("cssEditor"),
    { model: cssModel, ...options }
  );
  const jsEditor = monaco.editor.create(
    document.getElementById("jsEditor"),
    { model: jsModel, ...options }
  );

  // Emmet
  emmetMonaco.emmetHTML(monaco);
  emmetMonaco.emmetCSS(monaco);

  // JS IntelliSense
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true
  });

  const iframe = document.getElementById("preview");
  const consoleDiv = document.getElementById("console");

  function updatePreview() {
    consoleDiv.innerHTML = "";

    iframe.srcdoc = `
<!DOCTYPE html>
<html>
<body>
${htmlEditor.getValue()}
<script>
const send = (t,m)=>parent.postMessage({t,m},'*');
console.log=(...a)=>send('log',a.join(' '));
console.error=(...a)=>send('error',a.join(' '));
try{${jsEditor.getValue()}}catch(e){send('error',e.message)}
<\/script>
<style>${cssEditor.getValue()}</style>
</body>
</html>`;
  }

  window.addEventListener("message", e => {
    consoleDiv.innerHTML += e.data.m + "<br>";
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
  });

  htmlEditor.onDidChangeModelContent(updatePreview);
  cssEditor.onDidChangeModelContent(updatePreview);
  jsEditor.onDidChangeModelContent(updatePreview);

  updatePreview();

  // RESIZE COLUMNAS
  document.querySelectorAll(".resizer-vertical").forEach(resizer => {
    resizer.addEventListener("mousedown", e => {
      const left = resizer.previousElementSibling;
      const startX = e.clientX;
      const startWidth = left.offsetWidth;

      function move(ev) {
        left.style.flex = "none";
        left.style.width = startWidth + ev.clientX - startX + "px";
      }

      function stop() {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", stop);
      }

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", stop);
    });
  });

  // RESIZE OUTPUT
  const hResizer = document.querySelector(".resizer-horizontal");
  const editors = document.querySelector(".editors");

  hResizer.addEventListener("mousedown", e => {
    const startY = e.clientY;
    const startHeight = editors.offsetHeight;

    function move(ev) {
      editors.style.height = startHeight + ev.clientY - startY + "px";
    }

    function stop() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    }

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  });
});
