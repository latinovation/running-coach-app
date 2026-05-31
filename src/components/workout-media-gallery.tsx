import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUploadButton } from "@/components/media-upload-button";

interface Media {
  id: string;
  file_url: string;
  media_type: "screenshot" | "photo" | "document";
  created_at: string;
}

interface WorkoutMediaGalleryProps {
  media: Media[];
  workoutId: string;
  planId: string;
}

export function WorkoutMediaGallery({ media, workoutId, planId }: WorkoutMediaGalleryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Media</CardTitle>
        <MediaUploadButton workoutId={workoutId} planId={planId} />
      </CardHeader>
      <CardContent>
        {media.length === 0 ? (
          <p className="text-sm text-muted-foreground">No screenshots or photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((item) => (
              <a key={item.id} href={item.file_url} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-md border transition-opacity hover:opacity-80">
                {item.media_type === "document" ? (
                  <div className="flex h-32 items-center justify-center bg-muted text-sm text-muted-foreground">PDF</div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.file_url} alt="Workout screenshot" className="h-32 w-full object-cover" />
                )}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
