import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Download,
  Calendar,
  TrendingDown,
  Eye,
  X,
  ArrowLeft,
  ArrowRight,
  Search,
  Sparkles,
  Award,
  Heart
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import ConfirmModal from '../ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';

const PhotoProgress = ({ users, onUpdateUser, showToast }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showMemoryView, setShowMemoryView] = useState(false);
  const [uploadData, setUploadData] = useState({
    type: 'progress',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    weight: '',
    photoUrl: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [comparisonMode, setComparisonMode] = useState('slider'); // 'slider' or 'sidebyside'

  // Filter users with photos
  const usersWithPhotos = users.filter(user => 
    user.photos && user.photos.length > 0
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB for localStorage)
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size must be less than 2MB. Please compress the image.', 'error');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    // Compress and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 1200px width/height)
        let width = img.width;
        let height = img.height;
        const maxSize = 1200;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        
        // Check compressed size
        const sizeInBytes = (compressedDataUrl.length * 3) / 4;
        const sizeInKB = (sizeInBytes / 1024).toFixed(0);
        
        if (sizeInBytes > 1.5 * 1024 * 1024) {
          showToast(`Compressed image is still too large (${sizeInKB}KB). Please use a smaller image.`, 'error');
          return;
        }
        
        setUploadData({ ...uploadData, photoUrl: compressedDataUrl });
        showToast(`Image compressed to ${sizeInKB}KB`, 'success');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = () => {
    if (!selectedUser || !uploadData.photoUrl) {
      showToast('Please select a photo', 'error');
      return;
    }

    try {
      const photo = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
        type: uploadData.type,
        date: uploadData.date,
        notes: uploadData.notes,
        weight: uploadData.weight ? parseFloat(uploadData.weight) : null,
        photoUrl: uploadData.photoUrl,
        uploadedAt: new Date().toISOString()
      };

      const photos = selectedUser.photos || [];
      photos.push(photo);

      // Check localStorage space before saving
      const testData = JSON.stringify({ photos });
      const sizeInMB = (new Blob([testData]).size / (1024 * 1024)).toFixed(2);
      
      if (sizeInMB > 4) {
        showToast('Storage limit reached. Please delete some old photos first.', 'error');
        return;
      }

      onUpdateUser(selectedUser.id, { photos });

      showToast('Photo uploaded successfully!', 'success');
      setShowUploadModal(false);
      setUploadData({
        type: 'progress',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        weight: '',
        photoUrl: ''
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      if (error.name === 'QuotaExceededError') {
        showToast('Storage full! Please delete some old photos or use smaller images.', 'error');
      } else {
        showToast('Failed to upload photo. Please try again.', 'error');
      }
    }
  };

  const handleDeletePhoto = (userId, photoId) => {
    const user = users.find(u => u.id === userId);
    
    confirm({
      title: 'Delete Photo?',
      message: 'Are you sure you want to delete this photo? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        const photos = user.photos.filter(p => p.id !== photoId);
        onUpdateUser(userId, { photos });
        showToast('Photo deleted successfully!', 'success');
      }
    });
  };

  const handleComparePhotos = (user) => {
    setSelectedUser(user);
    setShowCompareModal(true);
    setSelectedPhotos([]);
    setSliderPosition(50);
  };

  const togglePhotoSelection = (photo) => {
    if (selectedPhotos.find(p => p.id === photo.id)) {
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id));
    } else if (selectedPhotos.length < 2) {
      setSelectedPhotos([...selectedPhotos, photo]);
    }
  };

  const handleSliderMove = (e) => {
    if (!isDragging) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleSliderMoveTouch = (e) => {
    if (!isDragging) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const generateTransformationVideo = async () => {
    if (!selectedUser || !selectedUser.photos || selectedUser.photos.length < 2) {
      showToast('Need at least 2 photos to create a video', 'error');
      return;
    }

    setGeneratingVideo(true);
    setVideoUrl(null);

    try {
      // Sort photos from oldest to newest
      const sortedPhotos = [...selectedUser.photos].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1280;
      canvas.height = 720;

      // Create video stream from canvas
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000 // 5 Mbps
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        showToast('Transformation video created! (WebM format)', 'success');
      };

      // Start recording
      mediaRecorder.start();

      const frameDuration = 1500; // 1.5 seconds per photo
      const fps = 30;
      const framesPerPhoto = (frameDuration / 1000) * fps;

      // Render each photo
      for (let photoIndex = 0; photoIndex < sortedPhotos.length; photoIndex++) {
        const photo = sortedPhotos[photoIndex];
        const img = new Image();
        img.src = photo.photoUrl;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Render this photo for the required number of frames
        for (let frame = 0; frame < framesPerPhoto; frame++) {
          // Clear canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Calculate scaling to fit image while maintaining aspect ratio
          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          );
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;

          // Draw image
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

          // Add date and weight overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            format(parseISO(photo.date), 'MMMM dd, yyyy'),
            canvas.width / 2,
            canvas.height - 45
          );
          
          if (photo.weight) {
            ctx.font = 'bold 24px Arial';
            ctx.fillText(
              `${photo.weight}kg`,
              canvas.width / 2,
              canvas.height - 15
            );
          }

          // Wait for next frame
          await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }
      }

      // Stop recording
      mediaRecorder.stop();
      
    } catch (error) {
      console.error('Error generating video:', error);
      showToast('Failed to generate video', 'error');
      setGeneratingVideo(false);
    } finally {
      setTimeout(() => setGeneratingVideo(false), 1000);
    }
  };

  const UserPhotoCard = ({ user }) => {
    const photos = user.photos || [];
    const sortedPhotos = [...photos].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    const latestPhoto = sortedPhotos[0];
    const firstPhoto = sortedPhotos[sortedPhotos.length - 1];

    const daysSinceFirst = firstPhoto 
      ? differenceInDays(new Date(), parseISO(firstPhoto.date))
      : 0;

    const weightChange = firstPhoto?.weight && latestPhoto?.weight
      ? (firstPhoto.weight - latestPhoto.weight).toFixed(1)
      : null;

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Upload and Stats */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <p className="text-sm font-semibold text-gray-700">{photos.length} Photos</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleComparePhotos(user)}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Compare
              </button>
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowUploadModal(true);
                }}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Stats */}
          {weightChange && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Weight Lost</span>
                <span className="text-lg font-bold text-green-600">
                  {weightChange}kg
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Over {daysSinceFirst} days
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* All Photos Grid - Full Width */}
          <div className="grid grid-cols-3 gap-2">
            {sortedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setViewingPhoto(photo)}
              >
                <img
                  src={photo.photoUrl}
                  alt={`Progress ${format(parseISO(photo.date), 'MMM dd')}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs text-white">
                    {format(parseISO(photo.date), 'MMM dd')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Single user mode - get the first (and only) user
  const user = users[0];
  const photos = user?.photos || [];
  const sortedPhotos = [...photos].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  const latestPhoto = sortedPhotos[0];
  const firstPhoto = sortedPhotos[sortedPhotos.length - 1];

  const daysSinceFirst = firstPhoto 
    ? differenceInDays(new Date(), parseISO(firstPhoto.date))
    : 0;

  const weightChange = firstPhoto?.weight && latestPhoto?.weight
    ? (firstPhoto.weight - latestPhoto.weight).toFixed(1)
    : null;

  // Set selected user for modals
  React.useEffect(() => {
    if (user) {
      setSelectedUser(user);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-lg">
        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No user data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">{photos.length} Photos</h3>
              <p className="text-sm text-gray-600">Progress gallery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMemoryView(true)}
              disabled={photos.length < 3}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Create Memory
            </button>
            <button
              onClick={() => handleComparePhotos(user)}
              disabled={photos.length < 2}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="w-5 h-5" />
              Compare
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>
          </div>
        </div>

        {/* Stats */}
        {weightChange && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Weight Lost</p>
                <p className="text-3xl font-bold text-green-600">{weightChange}kg</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="text-2xl font-bold text-gray-800">{daysSinceFirst} days</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
          <ImageIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">No photos uploaded yet</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium inline-flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload First Photo
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {sortedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setViewingPhoto(photo)}
              >
                <img
                  src={photo.photoUrl}
                  alt={`Progress ${format(parseISO(photo.date), 'MMM dd')}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs text-white font-medium">
                    {format(parseISO(photo.date), 'MMM dd')}
                  </p>
                  {photo.weight && (
                    <p className="text-xs text-white/90">{photo.weight}kg</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Upload Photo for {selectedUser.name}
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadData({
                    type: 'progress',
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                    weight: '',
                    photoUrl: ''
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Storage Warning */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                💡 <strong>Tip:</strong> Images are compressed to max 1200px and 70% quality. 
                Use photos under 2MB for best results.
              </p>
            </div>

            <div className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo *
                </label>
                {uploadData.photoUrl ? (
                  <div className="relative">
                    <img
                      src={uploadData.photoUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setUploadData({ ...uploadData, photoUrl: '' })}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Camera className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload photo</p>
                    <p className="text-xs text-gray-400 mt-1">Max 2MB • Auto-compressed</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo Type
                </label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="before">Before</option>
                  <option value="progress">Progress</option>
                  <option value="after">After</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={uploadData.date}
                  onChange={(e) => setUploadData({ ...uploadData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) - Optional
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={uploadData.weight}
                  onChange={(e) => setUploadData({ ...uploadData, weight: e.target.value })}
                  placeholder="Enter weight"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes - Optional
                </label>
                <textarea
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadData({
                    type: 'progress',
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                    weight: '',
                    photoUrl: ''
                  });
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadPhoto}
                disabled={!uploadData.photoUrl}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-7xl w-full p-6 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Compare Photos - {selectedUser.name}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={generateTransformationVideo}
                  disabled={generatingVideo || !selectedUser.photos || selectedUser.photos.length < 2}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {generatingVideo ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      🎬 Create Video
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCompareModal(false);
                    setSelectedPhotos([]);
                    setVideoUrl(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Video Preview */}
            {videoUrl && (
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1">
                      🎬 Transformation Video Ready!
                    </h4>
                    <p className="text-sm text-gray-600">
                      Video created in WebM format (compatible with most browsers)
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const video = document.createElement('video');
                        video.src = videoUrl;
                        video.controls = true;
                        video.autoplay = true;
                        video.style.maxWidth = '100%';
                        video.style.maxHeight = '80vh';
                        
                        const modal = document.createElement('div');
                        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
                        modal.onclick = () => modal.remove();
                        modal.appendChild(video);
                        document.body.appendChild(modal);
                      }}
                      className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
                    >
                      ▶ Play Video
                    </button>
                    <a
                      href={videoUrl}
                      download={`transformation-${selectedUser.name}.webm`}
                      className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
                    >
                      ⬇ Download WebM
                    </a>
                  </div>
                </div>
              </div>
            )}

            {selectedPhotos.length === 2 ? (
              <>
                {/* Weight Difference Banner */}
                {selectedPhotos[0].weight && selectedPhotos[1].weight && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 mb-6 text-center">
                    <p className="text-sm font-medium mb-1">Weight Change</p>
                    <p className="text-3xl font-bold">
                      {Math.abs(selectedPhotos[0].weight - selectedPhotos[1].weight).toFixed(1)}kg
                    </p>
                    <p className="text-sm mt-1 opacity-90">
                      {selectedPhotos[0].weight > selectedPhotos[1].weight ? 'Lost' : 'Gained'} • 
                      {' '}{differenceInDays(parseISO(selectedPhotos[1].date), parseISO(selectedPhotos[0].date))} days
                    </p>
                  </div>
                )}
                
                {/* Comparison Mode Toggle */}
                <div className="flex justify-center gap-3 mb-6">
                  <button
                    onClick={() => setComparisonMode('slider')}
                    className={`px-6 py-2 rounded-lg font-medium transition ${
                      comparisonMode === 'slider'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🎚️ Slider View
                  </button>
                  <button
                    onClick={() => setComparisonMode('sidebyside')}
                    className={`px-6 py-2 rounded-lg font-medium transition ${
                      comparisonMode === 'sidebyside'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👥 Side by Side
                  </button>
                </div>

                {comparisonMode === 'slider' ? (
                  /* Slider Comparison */
                  <div className="mb-8">
                    <div 
                      className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl select-none cursor-ew-resize bg-black"
                      onMouseMove={handleSliderMove}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      onTouchMove={handleSliderMoveTouch}
                      onTouchStart={() => setIsDragging(true)}
                      onTouchEnd={() => setIsDragging(false)}
                    >
                      {/* AFTER Image (Right side - full width background) */}
                      <div className="absolute inset-0 bg-black flex items-center justify-center">
                        <img
                          src={selectedPhotos[1].photoUrl}
                          alt="After"
                          className="max-h-full max-w-full object-contain"
                          draggable="false"
                        />
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                          ✨ AFTER
                        </div>
                      </div>

                      {/* BEFORE Image (Left side - revealed by slider) */}
                      <div 
                        className="absolute inset-0 overflow-hidden bg-black"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <div className="absolute inset-0 bg-black flex items-center justify-center">
                          <img
                            src={selectedPhotos[0].photoUrl}
                            alt="Before"
                            className="max-h-full max-w-full object-contain"
                            draggable="false"
                          />
                          <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                            📅 BEFORE
                          </div>
                        </div>
                      </div>

                      {/* Slider Handle */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-20"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto">
                          <div className="flex gap-1">
                            <ArrowLeft className="w-4 h-4 text-gray-700" />
                            <ArrowRight className="w-4 h-4 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instruction */}
                    <p className="text-center text-sm text-gray-600 mt-4">
                      👆 Drag the slider left or right to compare
                    </p>
                  </div>
                ) : (
                  /* Side by Side Comparison */
                  <div className="mb-8">
                    <div className="grid grid-cols-2 gap-6">
                      {selectedPhotos.map((photo, index) => (
                        <div key={photo.id} className="space-y-3">
                          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg h-[600px] flex items-center justify-center">
                            <img
                              src={photo.photoUrl}
                              alt={`Photo ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                            />
                            <div className={`absolute top-3 ${index === 0 ? 'left-3 bg-blue-500' : 'right-3 bg-green-500'} text-white px-3 py-1 rounded-full text-sm font-semibold z-10`}>
                              {index === 0 ? '📅 BEFORE' : '✨ AFTER'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Details */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {selectedPhotos.map((photo, index) => (
                    <div key={photo.id} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                      <p className="font-bold text-gray-800 text-lg mb-2">
                        {index === 0 ? '📅 Before' : '✨ After'}
                      </p>
                      <p className="font-semibold text-gray-700">
                        {format(parseISO(photo.date), 'MMMM dd, yyyy')}
                      </p>
                      {photo.weight && (
                        <p className="text-base text-gray-700 mt-1">
                          Weight: <span className="font-semibold">{photo.weight}kg</span>
                        </p>
                      )}
                      {photo.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{photo.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 mb-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium text-lg">
                  Select 2 photos to compare
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Click on photos below to select them
                </p>
              </div>
            )}

            {/* Smaller thumbnail grid */}
            <div className="border-t pt-6">
              <p className="text-sm font-semibold text-gray-600 mb-3">
                Select photos to compare:
              </p>
              <div className="grid grid-cols-6 xl:grid-cols-8 gap-2">
                {(selectedUser.photos || [])
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => togglePhotoSelection(photo)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedPhotos.find(p => p.id === photo.id)
                          ? 'ring-4 ring-primary scale-105'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                    >
                      <img
                        src={photo.photoUrl}
                        alt={format(parseISO(photo.date), 'MMM dd')}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-1.5">
                        <p className="text-[10px] text-white font-medium">
                          {format(parseISO(photo.date), 'MMM dd')}
                        </p>
                        {photo.weight && (
                          <p className="text-[9px] text-white/90">{photo.weight}kg</p>
                        )}
                      </div>
                      {selectedPhotos.find(p => p.id === photo.id) && (
                        <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {selectedPhotos.findIndex(p => p.id === photo.id) + 1}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Photo Modal */}
      {viewingPhoto && (() => {
        const currentIndex = sortedPhotos.findIndex(p => p.id === viewingPhoto.id);
        const hasPrevious = currentIndex > 0;
        const hasNext = currentIndex < sortedPhotos.length - 1;

        const goToPrevious = () => {
          if (hasPrevious) {
            setViewingPhoto(sortedPhotos[currentIndex - 1]);
          }
        };

        const goToNext = () => {
          if (hasNext) {
            setViewingPhoto(sortedPhotos[currentIndex + 1]);
          }
        };

        return (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            {/* Close Button */}
            <button
              onClick={() => setViewingPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Previous Arrow */}
            {hasPrevious && (
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition z-10"
              >
                <ArrowLeft className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Next Arrow */}
            {hasNext && (
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition z-10"
              >
                <ArrowRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Photo Content */}
            <div className="max-w-4xl w-full">
              <img
                src={viewingPhoto.photoUrl}
                alt="Progress"
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">
                      {format(parseISO(viewingPhoto.date), 'MMMM dd, yyyy')}
                    </p>
                    {viewingPhoto.weight && (
                      <p className="text-white/80 text-sm">Weight: {viewingPhoto.weight}kg</p>
                    )}
                    {viewingPhoto.notes && (
                      <p className="text-white/80 text-sm mt-2">{viewingPhoto.notes}</p>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">
                    {currentIndex + 1} / {sortedPhotos.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Transformation Memory View */}
      {showMemoryView && sortedPhotos.length >= 3 && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 z-50 overflow-y-auto">
          <div className="min-h-screen p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowMemoryView(false)}
              className="fixed top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-full transition z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Header */}
            <div className="text-center mb-12 pt-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
                <h1 className="text-5xl font-bold text-white">Your Transformation Journey</h1>
                <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-2xl text-white/90 mb-2">{user.name}</p>
              <p className="text-xl text-white/70">
                {daysSinceFirst} Days of Dedication • {photos.length} Milestones Captured
              </p>
              {weightChange && (
                <div className="mt-6 inline-block bg-white/20 backdrop-blur-lg rounded-2xl px-8 py-4">
                  <p className="text-white/80 text-sm mb-1">Total Transformation</p>
                  <p className="text-6xl font-bold text-yellow-300">{weightChange}kg</p>
                  <p className="text-white/70 text-lg mt-2">Lost & Never Looking Back! 🎉</p>
                </div>
              )}
            </div>

            {/* Timeline Journey */}
            <div className="max-w-6xl mx-auto space-y-16">
              {/* Starting Point */}
              <div className="text-center">
                <div className="inline-block bg-white/10 backdrop-blur-lg rounded-2xl p-2 mb-4">
                  <Award className="w-16 h-16 text-yellow-300" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Where It All Began</h2>
                <p className="text-white/70 text-lg">{format(parseISO(firstPhoto.date), 'MMMM dd, yyyy')}</p>
              </div>

              {/* Photo Grid - Chronological */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...sortedPhotos].reverse().map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:rotate-1">
                      <img
                        src={photo.photoUrl}
                        alt={`Day ${index + 1}`}
                        className="w-full h-80 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-yellow-300 font-bold text-lg">
                              Day {differenceInDays(parseISO(photo.date), parseISO(firstPhoto.date))}
                            </span>
                            {photo.weight && (
                              <span className="text-white font-bold text-xl">{photo.weight}kg</span>
                            )}
                          </div>
                          <p className="text-white/90 text-sm">
                            {format(parseISO(photo.date), 'MMM dd, yyyy')}
                          </p>
                          {photo.notes && (
                            <p className="text-white/70 text-sm mt-2 italic">"{photo.notes}"</p>
                          )}
                        </div>
                      </div>
                      {/* Milestone Badge */}
                      {index === 0 && (
                        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          🎯 START
                        </div>
                      )}
                      {index === sortedPhotos.length - 1 && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          ✨ LATEST
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Achievement Summary */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
                <Heart className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-white mb-4">
                  Incredible Achievement Unlocked! 🏆
                </h2>
                <p className="text-xl text-white/80 mb-6">
                  Every photo tells a story of dedication, discipline, and determination.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/10 rounded-xl p-6">
                    <p className="text-5xl font-bold text-yellow-300 mb-2">{daysSinceFirst}</p>
                    <p className="text-white/70">Days of Commitment</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6">
                    <p className="text-5xl font-bold text-green-300 mb-2">{photos.length}</p>
                    <p className="text-white/70">Progress Photos</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6">
                    <p className="text-5xl font-bold text-pink-300 mb-2">{weightChange || '0'}kg</p>
                    <p className="text-white/70">Weight Lost</p>
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="text-center pb-12">
                <p className="text-2xl text-white/90 italic mb-4">
                  "The journey of a thousand miles begins with a single step."
                </p>
                <p className="text-xl text-white/70">
                  You took that step. You kept going. You made it happen. 💪
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => setShowMemoryView(false)}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition shadow-2xl"
                  >
                    Continue Your Journey ✨
                  </button>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />
    </div>
  );
};

export default PhotoProgress;
