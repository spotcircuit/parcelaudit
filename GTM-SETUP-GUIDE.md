# GTM/GA4 Setup Guide

## Step 1: Create GTM Container
1. Go to https://tagmanager.google.com
2. Create a new container for your website
3. Copy the GTM ID (looks like GTM-XXXXXX)
4. Update NEXT_PUBLIC_GTM_ID in .env.local

## Step 2: Configure GTM Triggers

Create these triggers in GTM:

### 1. CTA Click Trigger
- **Trigger Type**: Custom Event
- **Event Name**: cta_click
- **Name**: CTA Click

### 2. Signup Submit Trigger
- **Trigger Type**: Custom Event
- **Event Name**: signup_submit
- **Name**: Signup Submit

### 3. Signup Success Trigger
- **Trigger Type**: Custom Event
- **Event Name**: signup_success
- **Name**: Signup Success

### 4. Keyword Alignment Trigger
- **Trigger Type**: Custom Event
- **Event Name**: keyword_alignment
- **Name**: Keyword Alignment

## Step 3: Configure GA4 Tags

### 1. GA4 Configuration Tag
- **Tag Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: Your GA4 Measurement ID (G-XXXXXXXXXX)
- **Trigger**: All Pages

### 2. GA4 Event - CTA Click
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Config
- **Event Name**: cta_click
- **Event Parameters**:
  - Parameter Name: cta_type
  - Value: {{Data Layer Variable - cta}}
- **Trigger**: CTA Click

### 3. GA4 Event - Signup Submit
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Config
- **Event Name**: signup_submit
- **Event Parameters**:
  - Parameter Name: email_domain
  - Value: {{Data Layer Variable - email_domain}}
- **Trigger**: Signup Submit

### 4. GA4 Event - Signup Success (Conversion)
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Config
- **Event Name**: signup_success
- **Event Parameters**:
  - Parameter Name: plan
  - Value: {{Data Layer Variable - plan}}
- **Trigger**: Signup Success

## Step 4: Configure Google Ads Conversion Tag

### Google Ads Conversion - Signup
- **Tag Type**: Google Ads Conversion Tracking
- **Conversion ID**: Your Google Ads Conversion ID
- **Conversion Label**: Your Conversion Label
- **Trigger**: Signup Success

## Step 5: Create Data Layer Variables

In GTM, create these Data Layer Variables:

1. **DLV - cta**
   - Variable Type: Data Layer Variable
   - Data Layer Variable Name: cta

2. **DLV - email_domain**
   - Variable Type: Data Layer Variable
   - Data Layer Variable Name: email_domain

3. **DLV - plan**
   - Variable Type: Data Layer Variable
   - Data Layer Variable Name: plan

4. **DLV - exact_keyword**
   - Variable Type: Data Layer Variable
   - Data Layer Variable Name: exact_keyword

## Step 6: Test in Preview Mode

1. Click "Preview" in GTM
2. Enter your website URL
3. Test these scenarios:
   - Click hero button → verify `cta_click` event fires
   - Submit email form → verify `signup_submit` event fires
   - After successful submission → verify `signup_success` event fires
   - Visit with ?kw=Test → verify `keyword_alignment` event fires

## Step 7: Mark Conversions in GA4

1. Go to GA4 > Admin > Events
2. Find `signup_success` event
3. Toggle "Mark as conversion"

## Step 8: Verify in GA4 DebugView

1. Go to GA4 > Admin > DebugView
2. Test your events on the website
3. Verify all events appear correctly

## Step 9: Publish GTM Container

Once everything tests correctly:
1. Click "Submit" in GTM
2. Add version name and description
3. Click "Publish"