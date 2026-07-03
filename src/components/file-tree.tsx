import { motion } from 'motion/react';
import { FolderOpen, FileText } from 'lucide-react';

export function FileTreeSection() {
  return (
    <section className="py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
          Structured Data Inputs
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-16">
          Sybr uses a clear, structured directory format ensuring reproducibility and organized project management.
        </p>

        <div className="max-w-xl mx-auto text-left bg-background p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <div className="space-y-3 font-mono text-sm sm:text-base">
            
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <FolderOpen className="w-5 h-5 text-primary" /> inputs/
            </div>
            
            <div className="pl-6 space-y-3 border-l tracking-wide border-border ml-2.5">
              
              <div>
                <div className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <FolderOpen className="w-4 h-4 text-primary/70" /> Ancestor_seq_recunstruction/
                </div>
                <div className="pl-6 text-muted-foreground mt-1 text-xs sm:text-sm">
                  └─ LastZ_alignments/, seq/, species_info.txt, tree.txt
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <FolderOpen className="w-4 h-4 text-primary/70" /> eba_analysis/
                </div>
                <div className="pl-6 text-muted-foreground mt-1 text-xs sm:text-sm">
                  └─ chr_size.txt, classification.eba, reference.fasta
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <FolderOpen className="w-4 h-4 text-primary/70" /> enrichment_analysis/
                </div>
                <div className="pl-6 text-muted-foreground mt-1 text-xs sm:text-sm">
                  └─ 3kegg_annotationTOgenes.txt, protein_annotation.tsv
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <FolderOpen className="w-4 h-4 text-primary/70" /> synteny_processing/
                </div>
                <div className="pl-6 text-muted-foreground mt-1 text-xs sm:text-sm">
                  └─ Satsuma_alignments/, all_sequence_lengths.txt
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
