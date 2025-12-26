"use client"
import React,{useState,useEffect} from 'react'
import axios from 'axios';
import { useRouter } from 'next/navigation';

function VideoUpload() {
const[file,setFile] = useState<File | null>(null);
const [title , setTitle] = useState('');
const [description , setDescription] = useState('');
const [isUploading , setIsUploading] = useState(false);
const [notification , setNotification] = useState<string>("");

const router = useRouter();
// max file size of 60 mb 
const MAX_FILE_SIZE = 60 * 1024 * 1024;

const handleSubmit = async (e : React.FormEvent) => {
e.preventDefault();
setNotification("");
if(!file) return ;
if(file.size > MAX_FILE_SIZE) {
setNotification("File size exceeds 60 MB limit.");
// dont use alert here because it stops the js execution and cannot redirect after that
return ;
}
setIsUploading(true);
  const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("originalSize", file.size.toString());

 try {
          const response = await axios.post("/api/video-upload", formData)
            // check for 200 response
if(response.status === 200) {
            // notification for success
            setNotification("Video uploaded successfully!");
}
 router.push("/")
        } catch (error) {
            console.log(error)
            // notification for failure
            setNotification("Error uploading video. Please try again.")
        } finally{
            setIsUploading(false)
             setNotification("");
        }


}



  return (
    <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Upload Video</h1>

          {notification && (
            <div className="mb-4">
              <div className={`alert ${notification.toLowerCase().includes('success') ? 'alert-success' : 'alert-error'} shadow-lg`}>
                <div>{notification}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="title">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                required
                id="title"
              />
            </div>
            <div>
              <label className="label" htmlFor="description">
                <span className="label-text" >Description</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full"
             id ="description"
              />
            </div>
            <div>
              <label className="label" htmlFor="video-file">
                <span className="label-text">Video File</span>
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file-input file-input-bordered w-full"
                required
                id="video-file"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Video"}
            </button>
          </form>
        </div>
  )
}

export default VideoUpload