import { useState } from "react";
import { Copy } from "lucide-react";

export function AnalysisForm() {
  const [formData, setFormData] = useState({
    base_input_dir: "",
    base_output_dir: "",
    synteny_processing: false,
    eba_analysis: false,
    enrichment_analysis: false,
    chainNet_generation: false,
    Ancestor_seq_recunstruction: false,
    reference_name: "",
    reference_species: "",
    eba_n: 5,
    eba_p: 300,
    getenrich_r: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoadDemo = () => {
    setFormData({
      base_input_dir: "/path/to/demo/inputs",
      base_output_dir: "/path/to/demo/outputs",
      synteny_processing: true,
      eba_analysis: true,
      enrichment_analysis: true,
      chainNet_generation: true,
      Ancestor_seq_recunstruction: true,
      reference_name: "Adineta_vaga",
      reference_species: "vaga",
      eba_n: 5,
      eba_p: 300,
      getenrich_r: "ko",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate job submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Analysis job submitted successfully!");
    }, 1500);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
          <Copy className="h-5 w-5" />
          Job Configuration
        </h2>
        <button
          type="button"
          onClick={handleLoadDemo}
          className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
        >
          Load Demo Configuration
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Directories */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-border pb-2">Directories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Directory</label>
              <input
                type="text"
                name="base_input_dir"
                value={formData.base_input_dir}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md bg-input border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                placeholder="/path/to/inputs"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Directory</label>
              <input
                type="text"
                name="base_output_dir"
                value={formData.base_output_dir}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md bg-input border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                placeholder="/path/to/outputs"
                required
              />
            </div>
          </div>
        </section>

        {/* Pipeline Stages */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-border pb-2">Pipeline Stages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: "synteny_processing", label: "Synteny Processing" },
              { id: "eba_analysis", label: "EBA Analysis" },
              { id: "enrichment_analysis", label: "Enrichment Analysis" },
              { id: "chainNet_generation", label: "ChainNet Generation" },
              { id: "Ancestor_seq_recunstruction", label: "Ancestor Reconstruction" },
            ].map((stage) => (
              <label key={stage.id} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <input
                  type="checkbox"
                  name={stage.id}
                  checked={formData[stage.id as keyof typeof formData] as boolean}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm font-medium">{stage.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Reference & Parameters */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-border pb-2">Parameters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Genus_Species</label>
              <input
                type="text"
                name="reference_name"
                value={formData.reference_name}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md bg-input border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                placeholder="e.g. Adineta_vaga"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Species Short Name</label>
              <input
                type="text"
                name="reference_species"
                value={formData.reference_species}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md bg-input border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                placeholder="e.g. vaga"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">EBA Iterations (n)</label>
              <input
                type="number"
                name="eba_n"
                value={formData.eba_n}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md bg-input border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">EBA Primary Res (p)</label>
              <input
                type="number"
                name="eba_p"
                value={formData.eba_p}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md bg-input border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                min="100"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">KEGG Code (getENRICH)</label>
              <input
                type="text"
                name="getenrich_r"
                value={formData.getenrich_r}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md bg-input border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                placeholder="e.g. ko"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Job...
              </>
            ) : (
              "Submit Analysis Job"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
