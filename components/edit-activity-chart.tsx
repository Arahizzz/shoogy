import { Observable, of, switchMap, tap } from 'rxjs';

import ScatterChart from '~/components/scatter-chart';
import { Activity } from '~/core/models/activity';
import { useObservable } from 'observable-hooks';
import { editActivityChartPipeline } from '~/core/chart/editActivityChart';

type CombinedChartProps = {
  activities$: Observable<Observable<Activity>[]>;
};

export default function EditActivityChart({ activities$ }: CombinedChartProps) {
  const plotInfo$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        switchMap(([a]) => a),
        switchMap(editActivityChartPipeline)
      ),
    [activities$]
  );

  return <ScatterChart series={[plotInfo$]} dataZoom={of(undefined)} />;
}
