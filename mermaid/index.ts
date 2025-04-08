import {IInputs, IOutputs} from "./generated/ManifestTypes";
import mermaid from 'mermaid'

export class MermaidJS implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    // Reference to the control container HTMLDivElement
    private _container: HTMLDivElement;
    // Reference to preElement HTMLPreElement
    private preElement: HTMLPreElement

    private default_mermaid_text = "flowchart LR \n A[Christmas] -->|Get money| B(v2 No diagram type detected matching given configuration for text)\n B --> C{Let me think}\nC -->|One| D[Laptop]\nC -->|Two| E[iPhone]\nC -->|Three| F[fa:fa-car Car]"
    private mermaidText: string;
    private maxWidth: number|null;

    private clickedItemName: string|null;

    //output
    private heightAuto: number;
    private clicksEnabled = true;

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }
    public updateMermaidView( text:string ) {

        // const _obj = document.getElementById("mermaid2")!;
        mermaid.render('mermaid', text)
            .then( res => {
                this._container.innerHTML = res.svg

                // ✅ Enforce no max-width on rendered SVG manually
                const svgEl = this._container.querySelector("svg") as SVGElement;
                if (svgEl) {
                    svgEl.style.maxWidth = "none";
                    // svgEl.style.width = "100%";
                    // svgEl.style.height = "auto";
                }

                // ✅ Add click listener to all nodes after rendering if clicks is enabled
                if(this.clicksEnabled){
                    const nodes = this._container.querySelectorAll(".node");
                    nodes.forEach(node => {
                        // Set pointer cursor on hover
                        (node as HTMLElement).style.cursor = "pointer";

                        node.addEventListener("click", () => {
                            // Get the node id from the <g> tag or child element
                            const nodeId = node.id || node.getAttribute("id") || "";
                            // Store it in clickedItemName
                            this.clickedItemName = nodeId.split("-")[1];

                            // console.log("Clicked node ID:", this.clickedItemName);
                        });
                    });

                }
            })
            .catch( e => console.log("e: " + e));
    }
    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        // ✅ Mermaid config: disable max-width
        mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            themeVariables: {
                useMaxWidth: false
            }
        });
        this.clicksEnabled = context.parameters.clicksEnabled.raw ?? true;

        // Add control initialization code
        this._container = container;

        this.preElement = document.createElement("pre")
        this.preElement.setAttribute("class", "pcfControl");

        this._container.appendChild(this.preElement);
        this._container.classList.add("mermaid")
        // this._container.id = "mermaid2"

        this.mermaidText = context.parameters.mermaid_text.raw == "" || context.parameters.mermaid_text.raw == null ? this.default_mermaid_text : context.parameters.mermaid_text.raw;
        this.updateMermaidView( this.mermaidText)
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add code to update control view
        const mermaidText = context.parameters.mermaid_text.raw == "" || context.parameters.mermaid_text.raw == null ? this.default_mermaid_text : context.parameters.mermaid_text.raw;
        const clicksEnabled = context.parameters.clicksEnabled.raw ?? true

        if(this.mermaidText != mermaidText || this.clicksEnabled != clicksEnabled){
            // console.log(mermaidText)
            this.updateMermaidView( mermaidText )
            this.mermaidText = mermaidText
            this.clicksEnabled = clicksEnabled
        }

        const gEl = this._container.querySelector("g") as SVGGElement;
        const gElHeight = gEl.getBoundingClientRect().height;
        if(gElHeight !== null){
            this.heightAuto = Math.floor(gElHeight) + 1
            // console.log(this.heightAuto)
            // console.log(this.getOutputs())
        }

    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {
            heightAuto: this.heightAuto,
            clickedNodeKey: this.clickedItemName ?? ""
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to clean up control if necessary
    }
}
