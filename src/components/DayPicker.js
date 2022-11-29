import React, { useState } from 'react';
import DatePicker from 'react-date-picker';


export default function Example() {
  const [value, onChange] = useState(new Date());

  return (
    <div className="DatePicker">
          <DatePicker
            calendarAriaLabel="Toggle calendar"
            clearAriaLabel="Clear value"
            dayAriaLabel="Day"
            monthAriaLabel="Month"
            nativeInputAriaLabel="Date"
            onChange={onChange}
            value={value}
            yearAriaLabel="Year"
          />
    </div>
  );
}