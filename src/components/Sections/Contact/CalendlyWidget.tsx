import {FC, memo, useEffect} from 'react';

interface CalendlyWidgetProps {
  url: string;
}

const CalendlyWidget: FC<CalendlyWidgetProps> = memo(({url}) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div
      className="calendly-inline-widget rounded-lg overflow-hidden"
      data-url={url}
      style={{minWidth: '320px', height: '630px'}}
    />
  );
});

CalendlyWidget.displayName = 'CalendlyWidget';
export default CalendlyWidget;

