import os
import subprocess

def convert_mp3_to_m4a():
    for filename in os.listdir('.'):
        if filename.lower().endswith('.mp3'):
            base = os.path.splitext(filename)[0]
            m4a_filename = f"{base}.m4a"

            print(f"Converting: {filename} → {m4a_filename}")
            
            # Call FFmpeg to do the conversion
            result = subprocess.run([
                "ffmpeg", "-y", "-i", filename, "-c:a", "aac", "-b:a", "192k", m4a_filename
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            if result.returncode == 0:
                os.remove(filename)
                print(f"Deleted original: {filename}")
            else:
                print(f"Failed to convert: {filename}")

if __name__ == "__main__":
    convert_mp3_to_m4a()