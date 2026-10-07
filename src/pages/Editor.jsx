import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Download,
  Play,
  Pause,
  Save,
  Plus,
  Music,
  Maximize2,
  Undo2,
  Redo2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useProject } from '../context/ProjectContext';
import { renderScene, hitTest } from '../graphics/Renderer';
import LayersPanel from '../components/LayersPanel';
import PropertiesPanel from '../components/PropertiesPanel';
import Timeline from '../components/Timeline';

const uid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

export default function Editor() {
  const {
    project,
    setProject,
    selectedId,
    setSelectedId,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    preview,
    setPreview,
  } = useProject();

  const canvasRef = useRef(null);
  const images = useRef({});
  const audioRef = useRef(null);

  const [audioSrc, setAudioSrc] = useState(null);
  const [history, setHistory] = useState([]);

  /*
   * Main Canvas rendering.
   *
   * The React application controls project state,
   * while the Canvas renderer draws the current frame.
   */
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');

    renderScene(
      ctx,
      project,
      currentTime,
      images.current
    );
  }, [project, currentTime]);

  /*
   * Animation loop.
   *
   * requestAnimationFrame advances currentTime while
   * the editor is playing.
   */
  useEffect(() => {
    let animationFrame;
    let lastTime = performance.now();

    const tick = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setCurrentTime((time) => {
          const nextTime = time + delta;

          if (nextTime >= project.duration) {
            setIsPlaying(false);
            return project.duration;
          }

          return nextTime;
        });
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [
    isPlaying,
    project.duration,
    setCurrentTime,
    setIsPlaying,
  ]);

  /*
   * Keep uploaded campaign image available to the Canvas renderer.
   */
  useEffect(() => {
    if (!project.assets?.image) return;

    const img = new Image();

    img.onload = () => {
      images.current.campaign = img;

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');

        renderScene(
          ctx,
          project,
          currentTime,
          images.current
        );
      }
    };

    img.src = project.assets.image;
  }, [project.assets?.image, project, currentTime]);

  /*
   * Play/pause background audio with animation.
   */
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  /*
   * Save the current project state into undo history.
   */
  const mutate = (updater) => {
    setHistory((previous) => [
      ...previous,
      project,
    ].slice(-10));

    setProject(updater(project));
  };

  /*
   * Add a basic graphical object.
   */
  const addElement = (type) => {
    const element = {
      id: uid(),
      type,
      x: 450,
      y: 260,
      width:
        type === 'text'
          ? 360
          : type === 'circle'
            ? 130
            : 220,
      height:
        type === 'text'
          ? 60
          : type === 'circle'
            ? 130
            : 90,

      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,

      zIndex: project.elements.length,

      visible: true,

      startTime: 0,
      endTime: project.duration,

      color:
        type === 'text'
          ? '#ffffff'
          : '#38bdf8',

      fontSize: 38,
      fontWeight: 700,

      text:
        type === 'text'
          ? 'NEW TEXT'
          : '',

      keyframes: {},
    };

    mutate((currentProject) => ({
      ...currentProject,
      elements: [
        ...currentProject.elements,
        element,
      ],
    }));

    setSelectedId(element.id);
  };

  /*
   * Upload an image and create an image graphical object.
   */
  const addImage = () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const source = reader.result;

        const img = new Image();

        img.onload = () => {
          const imageId = uid();

          images.current[imageId] = img;

          const element = {
            id: imageId,
            type: 'image',

            x: 450,
            y: 260,

            width: 300,
            height: 220,

            rotation: 0,

            scaleX: 1,
            scaleY: 1,

            opacity: 1,

            zIndex: project.elements.length,

            visible: true,

            startTime: 0,
            endTime: project.duration,

            imageKey: imageId,

            keyframes: {},
          };

          mutate((currentProject) => ({
            ...currentProject,
            elements: [
              ...currentProject.elements,
              element,
            ],
          }));

          setSelectedId(imageId);
        };

        img.onerror = () => {
          alert('The selected image could not be loaded.');
        };

        img.src = source;
      };

      reader.onerror = () => {
        alert('Unable to read the selected image.');
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  /*
   * Canvas click -> graphical object selection.
   */
  const handleCanvasClick = (event) => {
    if (!canvasRef.current) return;

    const rect =
      canvasRef.current.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) *
      project.width /
      rect.width;

    const y =
      (event.clientY - rect.top) *
      project.height /
      rect.height;

    const elementId = hitTest(
      project,
      currentTime,
      x,
      y
    );

    setSelectedId(elementId);
  };

  /*
   * WebM export using Canvas captureStream + MediaRecorder.
   */
  const exportVideo = () => {
    if (
      !canvasRef.current?.captureStream ||
      !window.MediaRecorder
    ) {
      alert(
        'WebM export is not supported in this browser.'
      );
      return;
    }

    setIsPlaying(false);
    setCurrentTime(0);

    const stream =
      canvasRef.current.captureStream(30);

    let mimeType = 'video/webm';

    if (
      !MediaRecorder.isTypeSupported(mimeType)
    ) {
      mimeType = 'video/webm;codecs=vp8';
    }

    if (!MediaRecorder.isTypeSupported(mimeType)) {
      alert(
        'This browser does not support WebM recording.'
      );
      return;
    }

    let recorder;

    try {
      recorder = new MediaRecorder(stream, {
        mimeType,
      });
    } catch (error) {
      alert(
        `Unable to start video export: ${error.message}`
      );
      return;
    }

    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data?.size) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = () => {
      setIsPlaying(false);

      alert(
        'An error occurred while exporting the video.'
      );
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, {
        type: 'video/webm',
      });

      const url = URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href = url;
      link.download = 'admotion-export.webm';

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setCurrentTime(0);
    };

    recorder.start();

    setIsPlaying(true);

    window.setTimeout(() => {
      setIsPlaying(false);

      if (
        recorder.state !== 'inactive'
      ) {
        recorder.stop();
      }
    }, project.duration * 1000 + 250);
  };

  /*
   * Save project to localStorage.
   */
  const saveProject = () => {
    try {
      localStorage.setItem(
        'admotion-project',
        JSON.stringify(project)
      );

      alert('Project saved locally.');
    } catch {
      alert(
        'Unable to save the project locally.'
      );
    }
  };

  /*
   * Upload background music.
   */
  const uploadAudio = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file.');
      return;
    }

    const source =
      URL.createObjectURL(file);

    setAudioSrc(source);

    setProject((currentProject) => ({
      ...currentProject,
      audioName: file.name,
    }));

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  /*
   * Undo the latest editor mutation.
   */
  const undo = () => {
    const previous =
      history[history.length - 1];

    if (!previous) return;

    setProject(previous);

    setHistory((items) =>
      items.slice(0, -1)
    );
  };

  return (
    <main className="editorPage">

      {/* TOP BAR */}
      <div className="editorTop">

        <Link
          to="/templates/product"
          className="icon"
          title="Back"
        >
          <ArrowLeft size={17} />
        </Link>

        <div className="projectName">
          <b>{project.name}</b>

          <small>
            Motion project · {project.duration}s
          </small>
        </div>

        <div className="editorActions">

          <button
            className="secondary"
            onClick={undo}
            disabled={history.length === 0}
            title="Undo"
          >
            <Undo2 size={14} />
          </button>

          <button
            className="secondary"
            disabled
            title="Redo"
          >
            <Redo2 size={14} />
          </button>

          <button
            className="secondary"
            onClick={() => {
              setCurrentTime(0);
              setPreview(true);
              setIsPlaying(true);
            }}
          >
            <Play size={14} />
            Preview
          </button>

          <button
            className="secondary"
            onClick={saveProject}
          >
            <Save size={14} />
            Save
          </button>

          <button
            className="primary"
            onClick={exportVideo}
          >
            <Download size={14} />
            Export WebM
          </button>

        </div>
      </div>

      {/* EDITOR BODY */}
      <div className="editorBody">

        {/* LEFT PANEL */}
        <aside className="leftPanel">

          <div className="panelLabel">
            ELEMENTS
          </div>

          <button
            onClick={() =>
              addElement('text')
            }
          >
            <Type />
            Text
            <Plus />
          </button>

          <button onClick={addImage}>
            <ImageIcon />
            Image
            <Plus />
          </button>

          <button
            onClick={() =>
              addElement('rectangle')
            }
          >
            <Square />
            Rectangle
            <Plus />
          </button>

          <button
            onClick={() =>
              addElement('circle')
            }
          >
            <Circle />
            Circle
            <Plus />
          </button>

          <div className="panelLabel space">
            AUDIO
          </div>

          <label className="audioUpload">
            <Music size={15} />

            {project.audioName ||
              'Upload music'}

            <input
              type="file"
              accept="audio/*"
              onChange={uploadAudio}
            />
          </label>

          {audioSrc && (
            <div className="audioControls">

              <button
                className="icon"
                onClick={() =>
                  audioRef.current?.play()
                }
              >
                Play
              </button>

              <button
                className="icon"
                onClick={() =>
                  audioRef.current?.pause()
                }
              >
                Pause
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                defaultValue="0.5"
                onChange={(event) => {
                  if (audioRef.current) {
                    audioRef.current.volume =
                      Number(event.target.value);
                  }
                }}
              />

            </div>
          )}

          <audio
            ref={audioRef}
            src={audioSrc || undefined}
          />

          <LayersPanel />

        </aside>

        {/* CANVAS */}
        <section className="canvasArea">

          <div className="canvasToolbar">

            <span>
              {project.width} × {project.height} Canvas
            </span>

            <button
              className="icon"
              title="Canvas size"
            >
              <Maximize2 size={14} />
            </button>

          </div>

          <div className="canvasHolder">

            <canvas
              ref={canvasRef}
              width={project.width}
              height={project.height}
              onClick={handleCanvasClick}
            />

          </div>

        </section>

        {/* RIGHT PROPERTIES PANEL */}
        <PropertiesPanel />

      </div>

      {/* TIMELINE */}
      <Timeline />

      {/* FULLSCREEN PREVIEW */}
      {preview && (
        <div className="previewOverlay">

          <div className="previewTop">

            <button
              className="icon"
              onClick={() => {
                setPreview(false);
                setIsPlaying(false);
              }}
            >
              Close
            </button>

          </div>

          <PreviewCanvas
            project={project}
            currentTime={currentTime}
            images={images.current}
          />

          <div className="previewControls">

            <button
              className="play"
              onClick={() =>
                setIsPlaying(
                  (playing) => !playing
                )
              }
            >
              {isPlaying ? (
                <Pause />
              ) : (
                <Play />
              )}
            </button>

            <button
              className="icon"
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(false);
              }}
            >
              Restart
            </button>

          </div>

        </div>
      )}

    </main>
  );
}


/*
 * Preview uses the SAME Canvas renderer as the
 * main editor. There is no separate animation system.
 */
function PreviewCanvas({
  project,
  currentTime,
  images,
}) {
  const previewRef = useRef(null);

  useEffect(() => {
    if (!previewRef.current) return;

    const ctx =
      previewRef.current.getContext('2d');

    renderScene(
      ctx,
      project,
      currentTime,
      images
    );
  }, [
    project,
    currentTime,
    images,
  ]);

  return (
    <canvas
      className="previewCanvas"
      ref={previewRef}
      width={project.width}
      height={project.height}
    />
  );
}