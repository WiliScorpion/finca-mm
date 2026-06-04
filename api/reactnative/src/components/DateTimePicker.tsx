import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';

interface Props {
  value: string;
  onChange: (date: string, time: string) => void;
  label: string;
  minDate?: Date;
}

export default function DateTimePicker({ value, onChange, label, minDate }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(selectedDate);

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    onChange(dateStr, selectedTime);
    setShowPicker(false);
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1);
    setSelectedDate(newDate);
  };

  const formatDisplayValue = () => {
    if (!value) return 'Select date and time';
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${selectedTime}`;
  };

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={value ? styles.valueText : styles.placeholder}>
          {formatDisplayValue()}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>

            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
                <Text style={styles.navText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
                <Text style={styles.navText}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeaders}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.dayHeader}>{day}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendar}>
              {Array.from({ length: 42 }, (_, i) => {
                const day = i - firstDay + 1;
                const isValidDay = day > 0 && day <= daysInMonth;
                const isSelected = isValidDay && day === selectedDate.getDate();
                const isPast = minDate && isValidDay && new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day) < minDate;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.dayCell,
                      isSelected && styles.selectedDay,
                      isPast && styles.pastDay,
                    ]}
                    onPress={() => isValidDay && !isPast && handleDateSelect(day)}
                    disabled={!isValidDay || isPast}
                  >
                    <Text style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      !isValidDay && styles.emptyDay,
                      isPast && styles.pastDayText,
                    ]}>
                      {isValidDay ? day : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Picker */}
            <Text style={styles.timeLabel}>Select Time</Text>
            <View style={styles.timePicker}>
              <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                {hours.map(hour => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.timeOption,
                      selectedTime.startsWith(hour) && styles.selectedTime,
                    ]}
                    onPress={() => setSelectedTime(`${hour}:${selectedTime.split(':')[1]}`)}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTime.startsWith(hour) && styles.selectedTimeText,
                    ]}>{hour}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.timeSeparator}>:</Text>
              <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                {minutes.map(minute => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.timeOption,
                      selectedTime.endsWith(minute) && styles.selectedTime,
                    ]}
                    onPress={() => setSelectedTime(`${selectedTime.split(':')[0]}:${minute}`)}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTime.endsWith(minute) && styles.selectedTimeText,
                    ]}>{minute}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPicker(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    borderColor: '#cd853f',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef9f0',
  },
  valueText: {
    fontSize: 16,
    color: '#8b4513',
  },
  placeholder: {
    fontSize: 16,
    color: '#a0522d',
  },
  icon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: '#8b4513',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#e8d4a8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cd853f',
  },
  navText: {
    fontSize: 20,
    color: '#8b4513',
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b4513',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a0522d',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#cd853f',
  },
  pastDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#8b4513',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyDay: {
    color: 'transparent',
  },
  pastDayText: {
    color: '#ccc',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b4513',
    marginBottom: 10,
    textAlign: 'center',
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    height: 150,
  },
  timeScroll: {
    maxHeight: 150,
    width: 60,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b4513',
    marginHorizontal: 10,
  },
  timeOption: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedTime: {
    backgroundColor: '#cd853f',
  },
  timeText: {
    fontSize: 18,
    color: '#8b4513',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8b4513',
    backgroundColor: '#fff',
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b4513',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#cd853f',
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  confirmText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
