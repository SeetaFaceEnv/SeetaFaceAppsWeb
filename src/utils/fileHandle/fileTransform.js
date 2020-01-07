// base64转blob
function dataURLtoBlob (dataurl) {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

// blob转base64
function blobToDataURL(blob, callback) {
  let fr = new FileReader()
  fr.onload = (e) => { 
    callback(e.target.result)
  }
  fr.readAsDataURL(blob)
}

export { dataURLtoBlob, blobToDataURL }
