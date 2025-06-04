
import type { StoredAdCreationEntry } from '@/app/dashboard/ad-creation/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, ExternalLink, Trash2 } from 'lucide-react';

interface AdCardProps {
  ad: StoredAdCreationEntry;
  onEdit: () => void;
  onViewLandingPage: () => void;
  onDelete: () => void;
}

export default function AdCard({ ad, onEdit, onViewLandingPage, onDelete }: AdCardProps) {
  const { data, createdAt } = ad;

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-lg mb-1 truncate" title={data.adConcept || data.batchDctNumber}>
            {data.adConcept || data.batchDctNumber || "Untitled Ad"}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete();}}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete Ad</span>
          </Button>
        </div>
        <CardDescription className="text-xs">
          Saved: {new Date(createdAt).toLocaleDateString()}
          {data.batchDctNumber && data.adConcept !== data.batchDctNumber && ` | DCT: ${data.batchDctNumber}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <p><strong className="text-muted-foreground">Desire:</strong> {data.desireTargeted}</p>
        <p><strong className="text-muted-foreground">Headline:</strong> <span className="truncate block" title={data.headline2New}>{data.headline2New || "-"}</span></p>
        <p><strong className="text-muted-foreground">Body:</strong> <span className="line-clamp-2" title={data.bodyCopy2New}>{data.bodyCopy2New || "-"}</span></p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="mr-2 h-3.5 w-3.5" /> Edit
        </Button>
        {data.landingPage && (
          <Button variant="link" size="sm" onClick={onViewLandingPage} className="text-primary hover:underline px-0">
            View Landing Page <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

    