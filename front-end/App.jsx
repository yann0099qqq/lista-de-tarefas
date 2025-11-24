import React, { useEffect, useState, useRef } from "react";

/* --------------------------------------------
   Componente de texto editável
   (Movido para cima para ser acessível por App)
--------------------------------------------- */
function EditableText({ initialText, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialText);

  const inputRef = useRef(null);

  useEffect(() => setValue(initialText), [initialText]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  function save() {
    if (value.trim() === initialText.trim()) {
      setEditing(false);
      return;
    }
    onSave(value);
    setEditing(false);
  }

  return (
    <div className="flex-1">
      {!editing ? (
        <div className="flex items-center justify-between">
          <p className="text-gray-800 font-medium break-words">{initialText}</p>

          <button
            onClick={() => setEditing(true)}
            className="hidden md:inline px-3 py-1 border rounded-lg bg-green-50 text-sm"
          >
            Editar
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2"
          />
          <button
            onClick={save}
            className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
          >
            Salvar
          </button>
          <button
            onClick={() => {
              setValue(initialText);
              setEditing(false);
            }}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* botão extra no mobile */}
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="md:hidden mt-2 px-3 py-1 border rounded-lg bg-green-50 text-sm"
        >
          Editar
        </button>
      )}
    </div>
  );
}


// Lista dinâmica completa com preview de PNG
export default function App() {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);
  const [feedback, setFeedback] = useState({ msg: "", type: "" });
  const [dragIndex, setDragIndex] = useState(null);

  // Novo estado para mostrar a imagem no botão (CORRIGIDO: Removido sintaxe TypeScript)
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem("lista_dinamica_items");
    if (raw) setItems(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("lista_dinamica_items", JSON.stringify(items));
  }, [items]);

  function showFeedback(msg, type = "success") {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback({ msg: "", type: "" }), 2500);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (text.trim().length < 5) {
      showFeedback("Erro: mínimo 5 caracteres.", "error");
      return;
    }

    const file = fileInputRef.current.files[0];
    let imgData = null;

    if (file) {
      if (file.type !== "image/png") {
        showFeedback("Apenas PNG é permitido.", "error");
        return;
      }
      imgData = await fileToDataUrl(file);
    }

    const newItem = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      img: imgData,
    };

    setItems((s) => [newItem, ...s]);
    setText("");
    setSelectedImage(null);
    fileInputRef.current.value = null;

    showFeedback("Item adicionado com sucesso!", "success");
  }

  function fileToDataUrl(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  function handleDelete(id) {
    setItems((s) => s.filter((it) => it.id !== id));
    showFeedback("Item excluído.", "success");
  }

  function handleEdit(id, newText) {
    if (newText.trim().length < 5) {
      showFeedback("Erro na edição: mínimo 5 caracteres.", "error");
      return;
    }

    setItems((s) =>
      s.map((it) => (it.id === id ? { ...it, text: newText } : it))
    );

    showFeedback("Item atualizado.", "success");
  }

  function moveItem(index, direction) {
    setItems((s) => {
      const arr = [...s];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= arr.length) return arr;

      const [item] = arr.splice(index, 1);
      arr.splice(newIndex, 0, item);

      return arr;
    });
  }

  function onDragStart(e, index) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  function onDrop(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setItems((s) => {
      const arr = [...s];
      const [moved] = arr.splice(dragIndex, 1);
      arr.splice(index, 0, moved);
      return arr;
    });

    setDragIndex(null);
    showFeedback("Ordem atualizada.", "success");
  }

  function handleImageReplace(id, file) {
    if (!file) return;

    if (file.type !== "image/png") {
      showFeedback("Apenas PNG é permitido.", "error");
      return;
    }

    fileToDataUrl(file).then((data) =>
      setItems((s) =>
        s.map((it) => (it.id === id ? { ...it, img: data } : it))
      )
    );

    showFeedback("Imagem atualizada.", "success");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-green-50 shadow-lg rounded-2xl p-6 md:p-10">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold">Lista Dinâmica</h1>
          <p className="text-sm text-gray-500">prototipo</p>
        </header>

        {/* Formulário */}
        <form
          onSubmit={handleAdd}
          className="grid gap-3 md:grid-cols-3 md:items-end"
        >
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Novo item
            </label>

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite pelo menos 5 caracteres..."
              className="mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <p className="mt-1 text-xs text-gray-400">
              Validação: mínimo 5 caracteres
            </p>
          </div>

          {/* Upload PNG com preview no botão */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              PNG (opcional)
            </label>

            <label className="cursor-pointer w-full inline-flex items-center justify-center rounded-lg px-4 py-2 border bg-green-50 shadow-sm">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="preview"
                  className="h-8 object-contain"
                />
              ) : (
                "Escolher PNG"
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setSelectedImage(url);
                  }
                }}
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                Adicionar
              </button>

              <button
                type="button"
                onClick={() => {
                  setText("");
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = null;
                }}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border bg-green-50"
              >
                Limpar
              </button>
            </div>
          </div>
        </form>

        {/* Feedback */}
        {feedback.msg && (
          <div
            className={`mt-4 rounded-md px-4 py-2 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* LISTA */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-3">
            Itens ({items.length})
          </h2>

          {items.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Nenhum item ainda — adicione algo.
            </div>
          )}

          <ul className="space-y-3">
            {items.map((it, idx) => (
              <li
                key={it.id}
                draggable
                onDragStart={(e) => onDragStart(e, idx)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, idx)}
                className="p-4 rounded-xl shadow-sm border bg-green-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                <div className="flex items-start gap-4 w-full md:w-2/3">
                  <div className="w-12 h-12 bg-green-50 flex items-center justify-center rounded-md overflow-hidden">
                    {it.img ? (
                      <img
                        src={it.img}
                        alt="thumb"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m8 4H8"
                        />
                      </svg>
                    )}
                  </div>

                  <EditableText
                    initialText={it.text}
                    onSave={(newText) => handleEdit(it.id, newText)}
                  />
                </div>

                <div className="flex gap-2">
                  <label className="cursor-pointer text-xs">
                    <input
                      type="file"
                      accept="image/png"
                      className="hidden"
                      onChange={(e) =>
                        handleImageReplace(it.id, e.target.files?.[0])
                      }
                    />
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm">
                      Trocar PNG
                    </span>
                  </label>

                  <button
                    onClick={() => moveItem(idx, -1)}
                    className="px-3 py-2 rounded-lg border bg-green-50 text-sm"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(idx, 1)}
                    className="px-3 py-2 rounded-lg border bg-green-50 text-sm"
                  >
                    ↓
                  </button>

                  <button
                    onClick={() => handleDelete(it.id)}
                    className="px-3 py-2 rounded-lg border bg-red-600 text-white text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-6 text-sm text-gray-500">
          Dica: arraste um item para reordenar (drag & drop). Também há botões ↑ ↓.
        </footer>
      </div>
    </div>
  );
}