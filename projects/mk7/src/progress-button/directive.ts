import {
  Directive,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  Renderer2,
  AfterViewInit
} from "@angular/core";

@Directive({
  selector: "[mk7ProgressButton]"
})
export class ProgressButtonDirective implements OnChanges, AfterViewInit {

  private button: HTMLButtonElement;
  private progress: HTMLSpanElement;
  private progressProp: string;
  private transEndEventName = "transitionend";
  private _classIE;

  options: {
    /**
     * time in ms that the status (success or error will be displayed)
     * during this time the button will be disabled
     */
    statusTime: number;
    callback?: (self) => void;
  } = {
      statusTime: 1500
    };

  _value: number;

  @Input()
  mk7ProgressButton: string;

  @Input()
  get value(): number {
    return this._value;
  }
  set value(v: number) {
    this._value = v;
  }

  @Input()
  showProcess = false;

  constructor(
    el: ElementRef,
    private renderer: Renderer2
  ) {
    this.button = el.nativeElement;
  }

  //@HostListener("click", ["$event.target"])
  //onClick(e) {
  //  this._setProgress(this.value);
  //}

  ngOnChanges(changes: SimpleChanges): void {
    const _showProcess = changes["showProcess"];
    const _value = changes["value"];
    if (this.progress && _showProcess) {
      if (_showProcess.currentValue) {
        this.startProcess();
      } else {
        this.stopProcess();
      }

    }

    if (this.progress && this.showProcess && _value) {
      if (_value.currentValue >= 0 && _value.currentValue <= 100) {
        this._setProgress(_value.currentValue);
        if (_value.currentValue >= 100) {
          this.stopProcess();
        }
      }
    }
  }
  ngAfterViewInit(): void {
    this._init();
    //this._setProgress(this.value);
  }

  private _init() {
    this._validate();
    // create structure
    this._create();
    // init events
    //this._initEvents();
  }

  private _validate() {
    // we will consider the fill/horizontal as default
    if (this.button.getAttribute("data-style") === null) {
      this.button.setAttribute("data-style", "fill");
    }
    if (this.button.getAttribute("data-vertical") === null &&
      this.button.getAttribute("data-horizontal") === null) {
      this.button.setAttribute("data-horizontal", "");
    }
    if (/*!support.transforms3d && */this.button.getAttribute("data-perspective") !== null) {
      this.button.removeAttribute("data-perspective");
      this.button.setAttribute("data-style", "fill");
      this.button.removeAttribute("data-vertical");
      this.button.setAttribute("data-horizontal", "");
    }
  }

  private _create() {
    const textEl = document.createElement("span");
    textEl.className = "content";
    textEl.innerHTML = this.button.innerHTML;
    const progressEl = document.createElement("span");
    progressEl.className = "progress";

    const progressInnerEl = document.createElement("span");
    progressInnerEl.className = "progress-inner";
    progressEl.appendChild(progressInnerEl);
    // clear content
    this.button.innerHTML = "";

    if (this.button.getAttribute("data-perspective") !== null) {
      const progressWrapEl = document.createElement("span");
      progressWrapEl.className = "progress-wrap";
      progressWrapEl.appendChild(textEl);
      progressWrapEl.appendChild(progressEl);
      this.button.appendChild(progressWrapEl);
    } else {
      this.button.appendChild(textEl);
      this.button.appendChild(progressEl);
    }

    // the element that serves as the progress bar
    this.progress = progressInnerEl;

    // property to change on the progress element
    if (this.button.getAttribute("data-horizontal") !== null) {
      this.progressProp = "width";
    } else if (this.button.getAttribute("data-vertical") !== null) {
      this.progressProp = "height";
    }
    this._enable();
  }

  private _setProgress(val: number): void {
    this.progress.style[this.progressProp] = val + "%";
  }

  private _initEvents() {
    this.button.addEventListener("click",
      () => {
        // disable the button
        this.button.setAttribute("disabled", "");
        // add class state-loading to the button
        // (applies a specific transform to the button depending which data - style is defined - defined in the stylesheets)
        this.classIE.remove(this.progress, "notransition");
        this.classIE.add(this.progress, "state-loading");

        setTimeout(() => {
          if (typeof this.options.callback === "function") {
            this.options.callback(this);
          } else {
            this._setProgress(1);
            const onEndTransFn = (ev: any = null) => {
              if (/*support.transitions &&*/ ev && ev.propertyName !== this.progressProp) {
                return;
              }
              this.button.removeEventListener(this.transEndEventName, onEndTransFn);
              this._stop();
            };

            if (/*support.transitions*/ true) {
              this.progress.addEventListener(this.transEndEventName, onEndTransFn);
            } else {
              onEndTransFn();
            }
          }
        },
          this.button.getAttribute("data-style") === "fill" ||
            this.button.getAttribute("data-style") === "top-line" ||
            this.button.getAttribute("data-style") === "lateral-lines"
            ? 0
            : 200); // TODO: change timeout to transitionend event callback
      });
  }

  private _stop(status = null) {

    setTimeout(() => {
      // fade out progress bar
      this.progress.style.opacity = "0";
      const onEndTransFn = (ev) => {
        if (/*support.transitions &&*/ ev && ev.propertyName !== "opacity") {
          return;
        }
        this.progress.removeEventListener(this.transEndEventName, onEndTransFn);
        this.classIE.add(this.progress, "notransition");
        this.progress.style[this.progressProp] = "0%";
        this.progress.style.opacity = "1";
      };

      if (/*support.transitions*/ true) {
        this.progress.addEventListener(this.transEndEventName, onEndTransFn);
      } else {
        onEndTransFn(null);
      }


      // add class state-success to the button
      if (typeof status === "number") {
        const statusClass = status >= 0 ? "state-success" : "state-error";
        this.classIE.add(this.button, statusClass);
        // after options.statusTime remove status
        setTimeout(() => {
          this.classIE.remove(this.button, statusClass);
          this._enable();
        },
          this.options.statusTime);
      } else {
        this._enable();
      }

      // remove class state-loading from the button
      this.classIE.remove(this.button, "state-loading");
    },
      100);
  }

  private _enable() {
    this.button.removeAttribute("disabled");
  }

  startProcess() {
    // disable the button
    this.button.setAttribute("disabled", "");
    // add class state-loading to the button
    // (applies a specific transform to the button depending which data - style is defined - defined in the stylesheets)
    this.classIE.remove(this.progress, "notransition");
    this.classIE.add(this.progress, "state-loading");
  }

  stopProcess() {
    this.button.removeAttribute("disabled");
    this.classIE.add(this.progress, "notransition");
    this.classIE.remove(this.progress, "state-loading");
  }

  get classIE() {

    if (this._classIE) {
      return this._classIE;
    }

    const classReg = (className) => {
      return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
    };
    let hasClass = (elem, c) => {
      return classReg(c).test(elem.className);
    };
    let addClass = (elem, c) => {
      if (!hasClass(elem, c)) {
        elem.className = elem.className + " " + c;
      }
    };
    let removeClass = (elem, c) => {
      elem.className = elem.className.replace(classReg(c), " ");
    };

    if ("classList" in document.documentElement) {
      hasClass = (elem, c) => {
        return elem.classList.contains(c);
      };
      addClass = (elem, c) => {
        elem.classList.add(c);
      };
      removeClass = (elem, c) => {
        elem.classList.remove(c);
      };
    }
    const toggleClass = (elem, c) => {
      const fn = hasClass(elem, c) ? removeClass : addClass;
      fn(elem, c);
    };

    this._classIE = {
      // full names
      hasClass,
      addClass,
      removeClass,
      toggleClass,
      // short names
      has: hasClass,
      add: addClass,
      remove: removeClass,
      toggle: toggleClass
    };

    return this._classIE;
  }
}
