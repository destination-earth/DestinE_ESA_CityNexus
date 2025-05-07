{{/*
Expand the name of the chart.
*/}}
{{- define "immerseon.name" -}}
{{- default .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "immerseon.fullname" -}}
{{- $name := default .Chart.Name }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "immerseon.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "immerseon.labels" -}}
app.kubernetes.io/name: {{ include "immerseon.name" . }}
helm.sh/chart: {{ include "immerseon.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Name of the frontend service
*/}}
{{- define "frontend.serviceName" -}}
{{ include "immerseon.fullname" . }}-frontend
{{- end -}}

{{/*
Name of the mobility model api service
*/}}
{{- define "mobility-cph.serviceName" -}}
{{ include "immerseon.fullname" . }}-mobility-model-api-cph
{{- end -}}

{{/*
Name of the mobility model api service
*/}}
{{- define "mobility-svq.serviceName" -}}
{{ include "immerseon.fullname" . }}-mobility-model-api-svq
{{- end -}}

{{/*
Name of the mobility model api service
*/}}
{{- define "mobility-aar.serviceName" -}}
{{ include "immerseon.fullname" . }}-mobility-model-api-aar
{{- end -}}

{{/*
Name of the citynexus api service
*/}}
{{- define "citynexus.serviceName" -}}
{{ include "immerseon.fullname" . }}-citynexus-api
{{- end -}}

{{/*
Name of the flood model service
*/}}
{{- define "flood.serviceName" -}}
{{ include "immerseon.fullname" . }}-flood-model-api
{{- end -}}

{{/*
Name of the flood api service
*/}}
{{- define "keycloak.serviceName" -}}
{{ include "immerseon.fullname" . }}-keycloak
{{- end -}}

