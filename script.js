require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs"
  }
});

require(["vs/editor/editor.main"], function () {

  /* =======================
     MODELOS
  ======================= */
  const htmlModel = monaco.editor.createModel("<h1>Hola mundo</h1>", "html");
  const cssModel = monaco.editor.createModel("", "css");
  const jsModel = monaco.editor.createModel("console.log('erick')", "javascript");

  const options = {
    theme: "vs-dark",
    automaticLayout: false,
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    minimap: { enabled: false },
    fontSize: 14
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

  /* =======================
     EMMET
  ======================= */
  emmetMonaco.emmetHTML(monaco);
  emmetMonaco.emmetCSS(monaco);

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true
  });

  /* =======================
     PREVIEW + CONSOLE
  ======================= */
  const iframe = document.getElementById("preview");
  const consoleDiv = document.getElementById("console");

  function updatePreview() {
    consoleDiv.innerHTML = "";

    iframe.srcdoc = `
<!DOCTYPE html>
<html>
<head>
<style>${cssEditor.getValue()}</style>
</head>
<body>
${htmlEditor.getValue()}
<script>
const send=(t,m)=>parent.postMessage({t,m},'*');
console.log=(...a)=>send('log',a.join(' '));
console.error=(...a)=>send('error',a.join(' '));
try{
${jsEditor.getValue()}
}catch(e){
send('error',e.message)
}
<\/script>
</body>
</html>`;
  }

  window.addEventListener("message", e => {
    if (!e.data || !e.data.m) return;
    consoleDiv.innerHTML += e.data.m + "<br>";
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
  });

  htmlEditor.onDidChangeModelContent(updatePreview);
  cssEditor.onDidChangeModelContent(updatePreview);
  jsEditor.onDidChangeModelContent(updatePreview);

  updatePreview();

  /* =======================
     RESIZE FIX MONACO
  ======================= */
  function relayoutEditors() {
    htmlEditor.layout();
    cssEditor.layout();
    jsEditor.layout();
  }

  /* =======================
     RESIZE COLUMNAS
  ======================= */
  document.querySelectorAll(".resizer-vertical").forEach(resizer => {
    resizer.addEventListener("mousedown", e => {
      const left = resizer.previousElementSibling;
      const startX = e.clientX;
      const startWidth = left.offsetWidth;

      function move(ev) {
        left.style.flex = "none";
        left.style.width = startWidth + ev.clientX - startX + "px";
        relayoutEditors();
      }

      function stop() {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", stop);
      }

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", stop);
    });
  });

  /* =======================
     RESIZE VERTICAL
  ======================= */
  const hResizer = document.querySelector(".resizer-horizontal");
  const editors = document.querySelector(".editors");

  hResizer.addEventListener("mousedown", e => {
    const startY = e.clientY;
    const startHeight = editors.offsetHeight;

    function move(ev) {
      editors.style.height =
        startHeight + ev.clientY - startY + "px";
      relayoutEditors();
    }

    function stop() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    }

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  });

  /* =======================
     RESIZE CONSOLA (CHROME)
  ======================= */
  const outputResizer = document.querySelector(".output-resizer");

  outputResizer.addEventListener("mousedown", e => {
    const startX = e.clientX;
    const startWidth = consoleDiv.offsetWidth;

    function move(ev) {
      consoleDiv.style.width =
        startWidth - (ev.clientX - startX) + "px";
    }

    function stop() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    }

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  });

});
