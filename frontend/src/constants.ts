
  
  export const DROPZONE_CONFIG = {
    multiple: true,
    accept: {
      "text/*": [".txt", ".htm", ".html"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "application/msword": [".doc"],
    },
    maxSize: 10_000_000, // Up to 10 MB file size.
  };
  