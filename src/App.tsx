import { useState } from "react";
import imageCompression from "browser-image-compression";
import "./App.css";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [webpFiles, setWebpFiles] = useState<Blob[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  };

  const convertToWebP = async () => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: "image/webp",
    };

    const promises = files.map(async (file) => {
      try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
      } catch (error) {
        console.error("Error during compression:", error);
        return null;
      }
    });

    const convertedFiles = await Promise.all(promises);
    setWebpFiles(convertedFiles.filter((file) => file !== null));
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder("webp_images");
    webpFiles.forEach((file, index) => {
      if (folder) {
        folder.file(`image-${index}.webp`, file);
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "converted_images.zip");
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  return (
    <div className="App">
      <h1>Convertidor de Imágenes a WebP</h1>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>
          Arrastra y suelta tus imágenes aquí, o haz clic para seleccionar
          archivos
        </p>
        <div className="preview-container">
          {files.map((file, index) => (
            <div key={index} className="preview-item">
              <img src={URL.createObjectURL(file)} alt={`preview ${index}`} />
            </div>
          ))}
        </div>
      </div>
      <button onClick={convertToWebP}>Convertir a WebP</button>
      {webpFiles.length > 0 && (
        <button onClick={downloadAll}>Descargar todas</button>
      )}
      <div className="images-container">
        {webpFiles.map((file, index) => (
          <div key={index} className="image-item">
            <h2>Imagen Convertida:</h2>
            <img src={URL.createObjectURL(file)} alt={`Converted ${index}`} />
            <a
              href={URL.createObjectURL(file)}
              download={`converted-${index}.webp`}
            >
              Descargar
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
