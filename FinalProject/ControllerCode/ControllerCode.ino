//https://youtu.be/X9DqwbC8Nr8

#define X_POT A0
#define Y_POT A1
#define CLR_BTN 7
const int buzzerPin = 9;
const int LEDpin = 6;
int incomingByte;

void setup() {
  pinMode( X_POT, INPUT );
  pinMode( Y_POT, INPUT );
  pinMode( CLR_BTN, INPUT );
  pinMode(buzzerPin, OUTPUT);
  pinMode (LEDpin, OUTPUT);
  
  
  Serial.begin( 9600 );
}

void fade_out() {
  for (int i = 255; i > 0; i--) {
    analogWrite(LEDpin, i);
    delay(5);
  }
}

void loop() {
  Serial.print( analogRead( X_POT ) );
  Serial.print( "," );
  Serial.print( analogRead( Y_POT ) );
  Serial.print( "," );
  Serial.print( digitalRead( CLR_BTN ) );
  Serial.println();

  if (Serial.available() > 0) {
    incomingByte = Serial.read();

    if (incomingByte == 0) {
      analogWrite(LEDpin, 255);
    }
    if (incomingByte == 1) {
      tone(buzzerPin, 262, 226);
      analogWrite(LEDpin, 255);
    }
    if (incomingByte == 3) {
      fade_out();
    }
    
    
 }

  delay(33);

}
