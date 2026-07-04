import { useMemo, useState } from 'react';
import { CheckCheck, Copy, Rocket } from 'lucide-react';
import type { FileCategory, JobSubmitRequest } from '@/lib/sybr-api';
import { sybrApi, SybrApiError, formatBytes } from '@/lib/sybr-api';
import {
  Alert,
  Card,
  Field,
  FileDrop,
  ProgressBar,
  SectionTitle,
  TextInput,
} from '@/components/sybr/primitives';
import { Switch } from '@/components/animate-ui/components/radix/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Stage definitions ─────────────────────────────────────────────────────────

interface StageState {
  synteny: boolean;
  eba: boolean;
  enrich: boolean;
  chainnet: boolean;
  ancestor: boolean;
  hgt: boolean;
}

const STAGE_META: { key: keyof StageState; num: string; label: string; desc: string }[] = [
  { key: 'synteny', num: '①', label: 'Synteny Processing', desc: 'Conserved block discovery' },
  { key: 'eba', num: '②', label: 'EBA Analysis', desc: 'Requires ① Synteny' },
  { key: 'enrich', num: '③', label: 'Enrichment', desc: 'Requires ① + ②' },
  { key: 'chainnet', num: '④', label: 'ChainNet Generation', desc: 'LastZ chain/net' },
  { key: 'ancestor', num: '⑤', label: 'Ancestor Recon.', desc: 'Requires ④ ChainNet' },
  { key: 'hgt', num: '⑥', label: 'HGT Overlap', desc: 'Requires ② and/or ⑤' },
];

type Uploads = Partial<Record<FileCategory, File[]>>;

interface SubmitProgress {
  phase: 'idle' | 'creating' | 'uploading' | 'starting' | 'done' | 'error';
  uploaded: number; // completed file count
  total: number; // total file count
  currentFile?: string;
  currentPercent: number; // 0–100 for the file currently uploading
  bytesUploaded: number; // cumulative bytes sent across all files
  bytesTotal: number; // total bytes to send across all files
  jobId?: string;
  errorMessage?: string;
}

const IDLE_PROGRESS: SubmitProgress = {
  phase: 'idle',
  uploaded: 0,
  total: 0,
  currentPercent: 0,
  bytesUploaded: 0,
  bytesTotal: 0,
};

export function SubmitJob({ apiKey }: { apiKey: string }) {
  const [jobName, setJobName] = useState('sybr_analysis');
  const [referenceName, setReferenceName] = useState('Genus_sps1');
  const [referenceSpecies, setReferenceSpecies] = useState('sps1');
  const [email, setEmail] = useState('');

  const [stages, setStages] = useState<StageState>({
    synteny: true,
    eba: false,
    enrich: false,
    chainnet: false,
    ancestor: false,
    hgt: false,
  });

  const [windowInput, setWindowInput] = useState('30,60,90');
  const [stepSize, setStepSize] = useState(3);
  const [ebaP, setEbaP] = useState(60);

  const [uploads, setUploads] = useState<Uploads>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<SubmitProgress>(IDLE_PROGRESS);
  const [copied, setCopied] = useState(false);

  // ── Dependency enforcement (mirrors the Streamlit force-off logic) ──────────
  const setStage = (key: keyof StageState, value: boolean) => {
    setStages((prev) => {
      const next = { ...prev, [key]: value };
      if (!next.synteny) {
        next.eba = false;
        next.enrich = false;
      }
      if (!next.eba) next.enrich = false;
      if (!next.chainnet) next.ancestor = false;
      if (!(next.eba || next.ancestor)) next.hgt = false;
      return next;
    });
  };

  const disabled: Record<keyof StageState, boolean> = {
    synteny: false,
    eba: !stages.synteny,
    enrich: !(stages.synteny && stages.eba),
    chainnet: false,
    ancestor: !stages.chainnet,
    hgt: !((stages.synteny && stages.eba) || (stages.chainnet && stages.ancestor)),
  };

  const windowSizes = useMemo(() => {
    try {
      const parsed = windowInput
        .split(',')
        .map((w) => Number.parseInt(w.trim(), 10) * 1000)
        .filter((n) => Number.isFinite(n) && n > 0);
      return parsed.length ? parsed : [30000, 60000, 90000];
    } catch {
      return [30000, 60000, 90000];
    }
  }, [windowInput]);

  const ebaN = uploads.satsuma_alignments?.length ?? 0;
  const emailValid =
    email.trim().length > 0 &&
    /@/.test(email) &&
    /\./.test(email.split('@').pop() ?? '');

  const setUpload = (category: FileCategory, files: File[]) =>
    setUploads((prev) => ({ ...prev, [category]: files }));

  const needFasta = stages.synteny || stages.chainnet || stages.eba;
  const isSubmitting =
    progress.phase === 'creating' || progress.phase === 'uploading' || progress.phase === 'starting';
  const overallPercent =
    progress.bytesTotal > 0
      ? Math.min(100, (progress.bytesUploaded / progress.bytesTotal) * 100)
      : 0;

  // ── Submit flow ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs: string[] = [];
    if (!email.trim()) errs.push('Email address is required');
    if (!referenceName) errs.push('Reference name is required');
    if (!referenceSpecies) errs.push('Reference species is required');
    if (stages.synteny && !uploads.satsuma_alignments?.length)
      errs.push('Satsuma alignment files are required for Synteny Processing');
    if (stages.eba && !uploads.classification?.length)
      errs.push('classification.eba is required for EBA Analysis');
    if (stages.eba && stages.synteny) {
      const windowKb = windowSizes.map((w) => Math.round(w / 1000));
      if (!windowKb.includes(ebaP))
        errs.push(
          `EBA resolution (p=${ebaP}) must match a synteny window size (kb): ${windowKb.join(', ')}`,
        );
    }
    if (stages.enrich && !uploads.annotation?.length)
      errs.push('protein_annotation.tsv is required for Enrichment Analysis');
    if (stages.chainnet && !uploads.lastz_alignments?.length)
      errs.push('LastZ .axt files are required for ChainNet Generation');
    if (needFasta && !uploads.fasta?.length) errs.push('FASTA genome files are required');
    if (stages.hgt && !uploads.hgt?.length) errs.push('hgt.txt is required for HGT Overlap Analysis');

    setErrors(errs);
    if (errs.length) return;

    const payload: JobSubmitRequest = {
      job_name: jobName,
      email: email.trim(),
      run_stages: {
        synteny_processing: stages.synteny,
        eba_analysis: stages.eba,
        enrichment_analysis: stages.enrich,
        chainNet_generation: stages.chainnet,
        Ancestor_seq_recunstruction: stages.ancestor,
        hgt_overlap_analysis: stages.hgt,
      },
      reference_name: referenceName,
      reference_species: referenceSpecies,
      eba: {
        n: stages.eba ? ebaN : 5,
        r: referenceName,
        p: stages.eba ? ebaP : 300,
      },
      window_sizes: windowSizes,
      step_size: stepSize * 1000,
      cores: 6,
    };

    const allFiles: { category: FileCategory; file: File }[] = [];
    for (const [category, files] of Object.entries(uploads)) {
      for (const file of files ?? []) allFiles.push({ category: category as FileCategory, file });
    }

    const bytesTotal = allFiles.reduce((sum, { file }) => sum + file.size, 0);

    try {
      setProgress({
        ...IDLE_PROGRESS,
        phase: 'creating',
        total: allFiles.length,
        bytesTotal,
      });
      const created = await sybrApi.createJob(apiKey, payload);
      const jobId = created.job_id;

      setProgress((p) => ({ ...p, phase: 'uploading', jobId }));

      let completedBytes = 0;
      for (let i = 0; i < allFiles.length; i++) {
        const { category, file } = allFiles[i];
        setProgress((p) => ({
          ...p,
          uploaded: i,
          currentFile: `${file.name} (${category})`,
          currentPercent: 0,
        }));
        await sybrApi.uploadFile(apiKey, jobId, category, file, (loaded, total) => {
          const pct = total > 0 ? (loaded / total) * 100 : 0;
          setProgress((p) => ({
            ...p,
            currentPercent: pct,
            bytesUploaded: Math.min(bytesTotal, completedBytes + loaded),
          }));
        });
        completedBytes += file.size;
        setProgress((p) => ({
          ...p,
          uploaded: i + 1,
          currentPercent: 100,
          bytesUploaded: completedBytes,
        }));
      }
      setProgress((p) => ({
        ...p,
        currentFile: undefined,
        currentPercent: 100,
        bytesUploaded: bytesTotal,
      }));

      setProgress((p) => ({ ...p, phase: 'starting' }));
      await sybrApi.startJob(apiKey, jobId);

      setProgress((p) => ({ ...p, phase: 'done', uploaded: allFiles.length, jobId }));
    } catch (err) {
      const message =
        err instanceof SybrApiError ? err.message : err instanceof Error ? err.message : 'Submission failed';
      setProgress((p) => ({ ...p, phase: 'error', errorMessage: message }));
    }
  };

  const copyJobId = async () => {
    if (!progress.jobId) return;
    try {
      await navigator.clipboard.writeText(progress.jobId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (progress.phase === 'done' && progress.jobId) {
    return (
      <Card className="space-y-4 p-6">
        <Alert variant="success">Pipeline started successfully.</Alert>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Your Job ID — save this to check results later:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border bg-muted px-3 py-2 font-mono text-sm">
              {progress.jobId}
            </code>
            <Button variant="outline" size="sm" onClick={copyJobId}>
              {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
        <Alert variant="info">
          Use the <strong>Check Job</strong> tab to monitor progress and download results.
        </Alert>
        <Button variant="secondary" onClick={() => setProgress(IDLE_PROGRESS)}>
          Submit another job
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card className="space-y-4 p-6">
        <SectionTitle hint="A label and reference identity for this run.">Job Identity</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Job Name">
            <TextInput value={jobName} onChange={(e) => setJobName(e.target.value)} />
          </Field>
          <Field
            label="Reference Name (Genus_species)"
            hint="Must match the FASTA filename (e.g. Adineta_vaga → Adineta_vaga.fa)"
          >
            <TextInput value={referenceName} onChange={(e) => setReferenceName(e.target.value)} />
          </Field>
          <Field label="Reference Species (short)" hint="Short name used internally by EBA">
            <TextInput value={referenceSpecies} onChange={(e) => setReferenceSpecies(e.target.value)} />
          </Field>
        </div>
        <Field
          label="Your Email Address"
          hint="Required — used for admin tracking and job-completion notifications."
          className="md:max-w-md"
        >
          <TextInput
            type="email"
            required
            value={email}
            placeholder="e.g. user@institution.edu"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
      </Card>

      {/* Stages */}
      <Card className="space-y-4 p-6">
        <SectionTitle hint="Select stages to run. Dependencies are enforced automatically.">
          Pipeline Stages
        </SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STAGE_META.map(({ key, num, label, desc }) => {
            const isOn = stages[key];
            const isDisabled = disabled[key];
            return (
              <label
                key={key}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors',
                  isOn ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
                  isDisabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {num} {label}
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={isOn}
                  disabled={isDisabled}
                  onCheckedChange={(v) => setStage(key, v)}
                />
              </label>
            );
          })}
        </div>
      </Card>

      {/* Synteny params */}
      {stages.synteny ? (
        <Card className="space-y-4 p-6">
          <SectionTitle>Advanced Synteny Parameters</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Window sizes (comma-separated, in kb)">
              <TextInput value={windowInput} onChange={(e) => setWindowInput(e.target.value)} />
            </Field>
            <Field label="Step size (kb)">
              <TextInput
                type="number"
                min={1}
                value={stepSize}
                onChange={(e) => setStepSize(Math.max(1, Number(e.target.value) || 1))}
              />
            </Field>
          </div>
        </Card>
      ) : null}

      {/* File uploads */}
      <Card className="space-y-6 p-6">
        <SectionTitle hint="Only inputs required by the selected stages are shown.">
          Input Files
        </SectionTitle>

        {needFasta ? (
          <FileDrop
            id="fasta"
            label="Reference & Genome FASTA files"
            accept=".fa,.fasta,.fna"
            multiple
            files={uploads.fasta ?? []}
            onChange={(f) => setUpload('fasta', f)}
            hint="Upload all species FASTA files including the reference genome."
          />
        ) : null}

        {stages.synteny ? (
          <div className="space-y-4">
            <FileDrop
              id="satsuma"
              label="① Satsuma Alignment files"
              accept=".txt"
              multiple
              files={uploads.satsuma_alignments ?? []}
              onChange={(f) => setUpload('satsuma_alignments', f)}
              hint={
                ebaN > 0
                  ? `${ebaN} alignment file(s) selected → EBA will use n=${ebaN}`
                  : 'One pairwise Satsuma alignment per non-reference species.'
              }
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FileDrop
                id="seqlen"
                label="Sequence Lengths file (optional)"
                accept=".txt"
                files={uploads.sequence_lengths ?? []}
                onChange={(f) => setUpload('sequence_lengths', f)}
                hint="all_sequence_lengths.txt — auto-generated from FASTA if omitted."
              />
              <FileDrop
                id="scaffolds"
                label="Scaffolds file (optional)"
                accept=".txt"
                files={uploads.scaffolds ?? []}
                onChange={(f) => setUpload('scaffolds', f)}
                hint="Scaffolds.txt — scaffold-level assemblies only."
              />
            </div>
          </div>
        ) : null}

        {stages.eba ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Genomes (n)" hint="Auto-counted from Satsuma alignments">
                <TextInput value={ebaN} readOnly className="cursor-default bg-muted" />
              </Field>
              <Field
                label="Resolution (p, kb)"
                hint="Must match one of your synteny window sizes."
              >
                <TextInput
                  type="number"
                  min={1}
                  value={ebaP}
                  onChange={(e) => setEbaP(Math.max(1, Number(e.target.value) || 1))}
                />
              </Field>
            </div>
            <FileDrop
              id="classification"
              label="② EBA Classification file"
              accept=".eba"
              files={uploads.classification ?? []}
              onChange={(f) => setUpload('classification', f)}
              hint="classification.eba"
            />
          </div>
        ) : null}

        {stages.enrich ? (
          <FileDrop
            id="annotation"
            label="③ Protein annotation file"
            accept=".tsv"
            files={uploads.annotation ?? []}
            onChange={(f) => setUpload('annotation', f)}
            hint="protein_annotation.tsv"
          />
        ) : null}

        {stages.chainnet ? (
          <div className="space-y-4">
            <FileDrop
              id="axt"
              label="④ LastZ Alignment files"
              accept=".axt"
              multiple
              files={uploads.lastz_alignments ?? []}
              onChange={(f) => setUpload('lastz_alignments', f)}
              hint="LastZ .axt files"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FileDrop
                id="species_info"
                label="species_info.txt"
                accept=".txt"
                files={uploads.species_info ?? []}
                onChange={(f) => setUpload('species_info', f)}
              />
              {stages.ancestor ? (
                <FileDrop
                  id="tree"
                  label="tree.txt (Newick format)"
                  accept=".txt"
                  files={uploads.tree ?? []}
                  onChange={(f) => setUpload('tree', f)}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {stages.ancestor && !stages.chainnet ? (
          <Alert variant="warning">
            ⑤ Ancestor Reconstruction requires ④ ChainNet — please enable it.
          </Alert>
        ) : null}

        {stages.hgt ? (
          <FileDrop
            id="hgt"
            label="⑥ HGT coordinates file"
            accept=".txt"
            files={uploads.hgt ?? []}
            onChange={(f) => setUpload('hgt', f)}
            hint="hgt.txt — tab-separated HGT coordinates."
          />
        ) : null}
      </Card>

      {/* Errors */}
      {errors.length > 0 ? (
        <Alert variant="error">
          <ul className="list-inside list-disc space-y-1">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {/* Submit progress */}
      {isSubmitting ? (
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="font-medium text-foreground">
              {progress.phase === 'creating' && 'Creating job…'}
              {progress.phase === 'uploading' && 'Uploading input files…'}
              {progress.phase === 'starting' && 'Starting pipeline…'}
            </p>
            {progress.phase === 'uploading' && progress.total > 0 ? (
              <span className="shrink-0 text-muted-foreground">
                {progress.uploaded}/{progress.total} files
              </span>
            ) : null}
          </div>

          {progress.phase === 'uploading' && progress.bytesTotal > 0 ? (
            <div className="space-y-3">
              {/* Overall byte progress */}
              <div className="space-y-1">
                <ProgressBar value={overallPercent} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{Math.round(overallPercent)}% overall</span>
                  <span className="font-mono">
                    {formatBytes(progress.bytesUploaded)} / {formatBytes(progress.bytesTotal)}
                  </span>
                </div>
              </div>

              {/* Current file progress */}
              {progress.currentFile ? (
                <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="min-w-0 flex-1 truncate font-mono text-foreground">
                      {progress.currentFile}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {Math.round(progress.currentPercent)}%
                    </span>
                  </div>
                  <ProgressBar value={progress.currentPercent} />
                </div>
              ) : null}
            </div>
          ) : (
            <ProgressBar value={progress.phase === 'starting' ? 100 : 10} />
          )}
        </Card>
      ) : null}

      {progress.phase === 'error' ? (
        <Alert variant="error">{progress.errorMessage ?? 'Submission failed.'}</Alert>
      ) : null}

      <Button
        size="lg"
        className="w-full"
        disabled={isSubmitting || !emailValid}
        onClick={handleSubmit}
      >
        <Rocket className="h-4 w-4" />
        {isSubmitting ? 'Submitting…' : 'Submit & Run Pipeline'}
      </Button>
    </div>
  );
}
