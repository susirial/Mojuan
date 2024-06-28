import React, {useCallback,useState} from 'react'
import {useDropzone} from 'react-dropzone'

function MyDropzone() {

    const [fileContent, setFileContent] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        const binaryStr = reader.result
        console.log('文件数据',binaryStr)
        setFileContent(prev=>prev+'\n'+binaryStr);
      }
      reader.readAsText(file)
    })
    
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  return (
    <>
        <div className="flex flex-col h-screen">
            
            <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
                <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
                <h1>React-Dropzone 示范</h1>
                    <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>Drop 一些文件</p>
                    </div>
                    <div>
                        {fileContent && <textarea value={fileContent} readOnly rows={10} cols={50} />}
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default MyDropzone