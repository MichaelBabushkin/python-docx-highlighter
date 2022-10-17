import React, { useRef, useState } from 'react';
import axios from 'axios';
import Loader from './Loader';

// drag drop file component
export default function FilesDragAndDrop() {
    
    // drag state
    const [dragActive, setDragActive] = useState(false)
    const [validFile, setValidFile] = useState(null)
    const [isError, setIsError] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    // const [result, setResult] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const inputRef = useRef(null);
  
  // handle drag events
  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

// triggers when file is dropped
const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && isFileValid(e.dataTransfer.files[0])) {
      // at least one file has been dropped so do something
      handleFiles(e.dataTransfer.files);
    }
  }

  // triggers when file is selected with click
const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      // at least one file has been selected so do something
      handleFiles(e.target.files);
    }
  }

const handleFiles = (files) =>{
    setIsOpen(false)
    setSelectedFile(files[0])
}

const isFileValid = (file) => {
  if (file.name.includes('docx') || file.name.includes('doc') ) {
    setValidFile(file.name)
    setIsError(null)
    return true
  }  else{
    setIsError("*Wrong type of file was attached")
    setValidFile(null)
    return false
  }
}

const handleHighlight = async() =>{
    if(!selectedFile){
      setIsError('*No file was added')
      return
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    const blob = new Blob([selectedFile.name], {type : 'text/plain'})
    formData.append('filename', blob, selectedFile.name)
    // formData.append('filename', selectedFile.name);
    try {
      setIsLoading(true)
      const response = await axios({
        method: "post",
        url: "http://127.0.0.1:5000/edit",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },

      })
      console.log(response);
      if (response.data.status === 200){
        // setResult(response.data.filepath)
        setIsOpen(true)
      }
    } catch(error) {
      console.log(error)
    }
    finally{
      setIsLoading(false)
    }
}

const handleOpenFolder = async() =>{
    try {
      const response = await axios({
        method: "get",
        url: "http://127.0.0.1:5000/open",
      })
      console.log(response);
    } catch(error) {
      console.log(error)
    }
}

  // triggers the input when the button is clicked
const onButtonClick = () => {
    inputRef.current.click();
  }


  return (
    <div className="div-file-upload">
      
    <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
      <input ref={inputRef} type="file" name="file" id="input-file-upload" multiple={true} onChange={handleChange} accept=".doc,.docx" />
      <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
        <div>
          <p>Drag and drop your file here or</p>
          <button className="upload-button" onClick={onButtonClick}>Upload a file</button>
          {isLoading && <Loader/>}
      { validFile && <div className="file-upload-status">{validFile}</div> }
      { isError && <div className="file-upload-error">{isError}</div> }
      {/* { result && <div className="file-upload-result">{result}</div> } */}
        </div> 
      </label>
      { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }

      <button className="highlight-button" onClick={handleHighlight}>Highlight</button>
      { isOpen && <button className="open-button" onClick={handleOpenFolder}>Open containing folder</button> }
    </form>
    </div>
  );
  };